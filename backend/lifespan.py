"""FastAPI lifespan – replaces deprecated on_event hooks."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from database import client, db
from indexes import ensure_indexes
from models import User
from security import pwd_context
from services.buildings import init_user_buildings
from services.config_cache import init_game_config
from services.research import init_user_research
from services.spaceport import assign_spaceport_to_user
from services.tick import (start_automatic_tick_system,
                           stop_automatic_tick_system)
from services.universe import generate_universe, init_game_state

logger = logging.getLogger(__name__)


async def _seed_test_user():
    existing = await db.users.find_one({"username": "TestUser1"})
    if not existing:
        test_user = User(
            username="TestUser1",
            email="testuser1@example.com",
            password_hash=pwd_context.hash("password123"),
        )
        await db.users.insert_one(test_user.dict())
        await init_user_research(test_user.id)
        await init_user_buildings(test_user.id)
        await assign_spaceport_to_user(db, test_user.id, test_user.username)
        # Give Werft level 2 and Raumhafen level 2 so they can design prototypes and fleets
        await db.user_buildings.update_one(
            {"user_id": test_user.id, "buildings.building_type": "werft"},
            {"$set": {"buildings.$.level": 2}},
        )
        await db.user_buildings.update_one(
            {"user_id": test_user.id, "buildings.building_type": "raumhafen"},
            {"$set": {"buildings.$.level": 2}},
        )
        # Give starter research
        await db.user_research.update_one(
            {"user_id": test_user.id, "research_levels.technology": "segel"},
            {"$set": {"research_levels.$.level": 2}},
        )
        await db.user_research.update_one(
            {"user_id": test_user.id, "research_levels.technology": "quarz"},
            {"$set": {"research_levels.$.level": 1}},
        )
        await db.user_research.update_one(
            {"user_id": test_user.id, "research_levels.technology": "laser"},
            {"$set": {"research_levels.$.level": 1}},
        )
        logger.info("Seeded TestUser1 with spaceport, buildings, and starter research")


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
