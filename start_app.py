import subprocess
import os
from my_logger import my_logger

if __name__ == '__main__':
    logger = my_logger(__name__)
    # change dir to Prepper App Path
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    command = ["yarn", "start"]
    try:
        out = subprocess.check_output(command, shell=True)
        logger.info(out.decode("utf-8"))
    except Exception as ex:
        logger.error(ex)