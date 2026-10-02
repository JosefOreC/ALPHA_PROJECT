from uuid import uuid4


class UuidOrderIds:
    def new(self) -> str:
        return str(uuid4())
