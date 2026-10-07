import random
from fastapi import HTTPException
from pymongo import ReturnDocument


async def assign_spaceport_to_user(db, user_id: str, username: str):
    """Assign an unowned planet at a random coordinate to the user as their home spaceport."""
    unowned_count = await db.planets.count_documents({"owner_id": None})
    if unowned_count == 0:
        raise HTTPException(status_code=400, detail="Keine freien Planeten für Raumhafen verfügbar")

    # Pick a random unowned planet so the player starts on a random coordinate
    random_skip = random.randint(0, unowned_count - 1)
    random_planet = await db.planets.find({"owner_id": None}).skip(random_skip).limit(1).to_list(1)

    planet = None
    if random_planet:
        planet = await db.planets.find_one_and_update(
            {"id": random_planet[0]["id"], "owner_id": None},
            {"$set": {"owner_id": user_id, "owner_username": username}},
            return_document=ReturnDocument.AFTER,
        )

    # Fallback in case of a race condition on the chosen random planet
    if not planet:
        planet = await db.planets.find_one_and_update(
            {"owner_id": None},
            {"$set": {"owner_id": user_id, "owner_username": username}},
            return_document=ReturnDocument.AFTER,
        )

    if not planet:
        raise HTTPException(status_code=400, detail="Keine freien Planeten für Raumhafen verfügbar")

    await db.users.update_one(
        {"id": user_id},
        {"$set": {"spaceport_position": planet["position"]}},
    )

    return planet
