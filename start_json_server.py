import subprocess
import os
import threading
from my_logger import my_logger

def run_comand(logger, cmd: list) -> None:
    out = subprocess.check_output(cmd)

if __name__ == '__main__':
    logger = my_logger(__name__)
    # change dir to json server Path
    os.chdir(os.path.abspath(os.sep.join([os.path.dirname( __file__ ),"json-server"] )))

    command = ["yarn", "start-ext"]
    command2 = ["python", "json-server/save_db.py"]
    try:
        logger.info("Starting Prepper App")
        thread1 = threading.Thread(target= run_comand, args=(command,))

        logger.info("Starting Backup Service")
        thread2 = threading.Thread(target= run_comand, args=(command2,))

        thread1.start()
        logger.info("Finished Start Prepper App")
        thread2.start()
        logger.info("Finished Start Backup Service")
    except Exception as ex:
        logger.error(ex)