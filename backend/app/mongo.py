from pymongo import MongoClient

from .config import settings

client = MongoClient(settings.mongo_url)

db = client["smart_student_hub"]

activities_collection = db["activities"]