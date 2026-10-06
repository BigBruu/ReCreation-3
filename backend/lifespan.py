"""FastAPI lifespan – replaces deprecated on_event hooks."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from database import client, db
from indexes import ensure_indexes
from models import Fleet, Position, ShipComponent, ShipDesign, User
from security import pwd_context
from services.buildings import init_user_buildings
from services.config_cache import init_game_config
from services.research import init_user_research
from services.ships import calculate_ship_stats
from services.spaceport import assign_spaceport_to_user
from services.tick import (start_automatic_tick_system,
                           stop_automatic_tick_system)
from services.universe import generate_universe, init_game_state

logger = logging.getLogger(__name__)


async def _seed_test_user():
    existing = await db.users.find_one({"username": "TestUser1"})
    user_id = None
    if not existing:
        test_user = User(
            username="TestUser1",
            email="testuser1@example.com",
            password_hash=pwd_context.hash("password123"),
        )
        await db.users.insert_one(test_user.dict())
        user_id = test_user.id
        await init_user_research(user_id)
        await init_user_buildings(user_id)
        await assign_spaceport_to_user(db, user_id, test_user.username)
    else:
        user_id = existing["id"]

    # Give Werft level 10 and Raumhafen level 10 so they can design prototypes and fleets
    await db.user_buildings.update_one(
        {"user_id": user_id, "buildings.building_type": "werft"},
        {"$set": {"buildings.$.level": 10}},
    )
    await db.user_buildings.update_one(
        {"user_id": user_id, "buildings.building_type": "raumhafen"},
        {"$set": {"buildings.$.level": 10}},
    )
    # Give starter research
    await db.user_research.update_one(
        {"user_id": user_id, "research_levels.technology": "segel"},
        {"$set": {"research_levels.$.level": 2}},
    )
    await db.user_research.update_one(
        {"user_id": user_id, "research_levels.technology": "quarz"},
        {"$set": {"research_levels.$.level": 1}},
    )
    await db.user_research.update_one(
        {"user_id": user_id, "research_levels.technology": "laser"},
        {"$set": {"research_levels.$.level": 1}},
    )

    # Ensure at least one design exists
    design = await db.ship_designs.find_one({"user_id": user_id})
    if not design:
        from models import CreateShipDesign
        create_data = CreateShipDesign(
            name="Scout Mk1",
            drive_type="segel",
            drive_level=1,
            drive_quantity=1,
            shield_type="stahl",
            shield_level=1,
            shield_quantity=1,
            weapon_type="laser",
            weapon_level=1,
            weapon_quantity=1,
        )
        new_design = ShipDesign(
            user_id=user_id,
            name="Scout Mk1",
            drive=ShipComponent(component_type="drive", component_name="segel", level=1, quantity=1),
            shield=ShipComponent(component_type="shield", component_name="stahl", level=1, quantity=1),
            weapon=ShipComponent(component_type="weapon", component_name="laser", level=1, quantity=1),
            calculated_stats=calculate_ship_stats(create_data),
        )
        await db.ship_designs.insert_one(new_design.dict())
        design = new_design.dict()

    # Ensure at least one active fleet exists
    fleet = await db.fleets.find_one({"user_id": user_id})
    if not fleet:
        user_doc = await db.users.find_one({"id": user_id})
        pos = user_doc.get("spaceport_position", {"x": 10, "y": 10})
        if pos["x"] == -1:
            pos = {"x": 10, "y": 10}
        new_fleet = Fleet(
            user_id=user_id,
            name="Flotte 1",
            position=Position(x=pos["x"], y=pos["y"]),
            ships=[{"design_id": design["id"], "quantity": 5}],
            fleet_speed=200,
            stance="defensive",
        )
        await db.fleets.insert_one(new_fleet.dict())
    else:
        # Reset movement state so fleet is stationary and ready for coordinate inputs
        await db.fleets.update_many(
            {"user_id": user_id},
            {"$set": {"movement_end_time": None, "movement_start_time": None, "target_position": None}}
        )

    logger.info("Seeded TestUser1 with spaceport, buildings, research, prototype, and fleet")


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Startup and shutdown logic for the game server."""
    await ensure_indexes(db)
    logger.info("MongoDB indexes created")

    await init_game_state()
    logger.info("TheCreation Authentic Game Engine started!")

    planet_count = await db.planets.count_documents({})
    logger.info(f"Found {planet_count} planets in database")
    if planet_count == 0:
        logger.info("Generating universe with planets...")
        await generate_universe()
        final_count = await db.planets.count_documents({})
        logger.info(f"Generated {final_count} planets")

    config = await init_game_config()
    logger.info(
        f"Game config: {config.max_players} max players, "
        f"{config.universe_size}x{config.universe_size} universe"
    )

    await _seed_test_user()

    await start_automatic_tick_system()
    logger.info(f"Automatic tick system started with {config.tick_duration}s interval")

    yield

    await stop_automatic_tick_system()
    client.close()
    logger.info("TheCreation server shutdown complete")
