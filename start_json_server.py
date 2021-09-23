import subprocess
import os
import threading
import logging
from logging.handlers import RotatingFileHandler


def my_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    formatter = logging.Formatter("%(asctime)s %(levelname)s: %(message)s", "%d.%m.%Y %H:%M:%S")
    file_handler = RotatingFileHandler("/var/log/start_json_server.log", maxBytes=16777216, backupCount=3)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger

def run_comand(cmd: list,logger) -> None:
    try:
        out = subprocess.check_output(cmd)
    except Exception as ex:
        logger.error(ex)

if __name__ == '__main__':
    logger = my_logger(__name__)
    # change dir to json server Path
    os.chdir(os.path.abspath(os.path.join(os.path.dirname( __file__ ),"json-server" )))

    command = ["yarn", "start-ext"]
    command2 = ["python3", "save_db.py"]
    try:
        logger.info("Starting Prepper App")
        thread1 = threading.Thread(target= run_comand, args=(command, logger,))

        logger.info("Starting Backup Service")
        thread2 = threading.Thread(target= run_comand, args=(command2,logger,))

        thread1.start()
        logger.info("Finished Start Prepper App")
        thread2.start()
        logger.info("Finished Start Backup Service")
    except Exception as ex:
        logger.error(ex)
