from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import logging

from .config import settings

logger = logging.getLogger(__name__)

class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = {}

    def insert_one(self, document):
        if "_id" not in document:
            from bson import ObjectId
            document["_id"] = ObjectId()
        self.data[str(document["_id"])] = document
        class Result:
            def __init__(self, id):
                self.inserted_id = id
        return Result(document["_id"])

    def find(self, query=None):
        out = []
        for doc in self.data.values():
            match = True
            if query:
                for k, v in query.items():
                    if k == "user_id" and v != doc.get("user_id"):
                        match = False
                    if k == "status" and v != doc.get("status"):
                        match = False
                    # Basic $in support for faculty dashboard
                    if isinstance(v, dict) and "$in" in v:
                        if doc.get(k) not in v["$in"]:
                            match = False
            if match:
                out.append(doc.copy())
        return out

    def find_one(self, query):
        results = self.find(query)
        return results[0] if results else None

    def update_one(self, query, update):
        doc = self.find_one(query)
        if doc:
            if "$set" in update:
                doc.update(update["$set"])
        return None

try:
    client = MongoClient(settings.mongo_url, serverSelectionTimeoutMS=2000)
    # The is_master command is cheap and does not require auth.
    client.admin.command('ismaster')
    db = client["smart_student_hub"]
    activities_collection = db["activities"]
    mongo_available = True
    logger.info("Connected to MongoDB")
except (ConnectionFailure, ServerSelectionTimeoutError, Exception):
    logger.error("Could not connect to MongoDB. Using in-memory mock for activities.")
    activities_collection = MockCollection("activities")
    mongo_available = False
