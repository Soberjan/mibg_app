from fastapi import APIRouter, HTTPException, Request, Query, Depends
from pydantic import BaseModel

from core.hostess import get_hostess, Hostess
from core.experiment import Exp

router = APIRouter(tags=["Analytics"])

@router.post('/hostess/create_lobby')
def create_lobby(hostess : Hostess = Depends(get_hostess)) -> str:
    try:
        lobby_id: str = hostess.create_lobby()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't create lobby because {e}")
    return lobby_id

@router.post('/hostess/read_lobby')
def read_lobby(hostess : Hostess = Depends(get_hostess)) -> str:
    try:
        lobby_id: str = hostess.read_lobby()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't read lobby because {e}")
    return lobby_id

