import logging
from logging.handlers import RotatingFileHandler


def my_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    formatter = logging.Formatter("%(asctime)s %(levelname)s: %(message)s", "%d.%m.%Y %H:%M:%S")
    file_handler = RotatingFileHandler(f"/var/log/{name}.log", maxBytes=16777216, backupCount=3)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger
