from fastapi import Request

def get_hostess(request: Request):
    return request.app.state.hostess

def get_database(request: Request):
    return request.app.state.database

def get_templates(request: Request):
    return request.app.state.templates
