from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

from app.config import settings


client = MongoClient(settings.mongodb_uri)


def get_database() -> Database:
    return client[settings.mongodb_database]


def get_junction_collection() -> Collection:
    return get_database()["junctions"]


def get_traffic_collection() -> Collection:
    return get_database()["traffic_observations"]
