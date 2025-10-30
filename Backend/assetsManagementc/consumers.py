
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
        else:
            self.user = self.scope["user"]
            self.group_name = f"user_{self.user.id}"

            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name') and self.channel_layer is not None:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)


    async def receive(self, text_data):
        # Optional: for client-to-server messages
        pass

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            "message": event["message"],
            # "notification_type": event["notification_type"],
            "asset": event.get("asset"),
            "assignment": event.get("assignment"),
            "created_at": event.get("created_at"),
        }))
