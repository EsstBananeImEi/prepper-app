import datetime
import os
import time
import shutil
import subprocess
import logging
from logging.handlers import RotatingFileHandler

os.chdir(os.path.dirname(os.path.abspath(__file__)))

def my_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    formatter = logging.Formatter("%(asctime)s %(levelname)s: %(message)s", "%d.%m.%Y %H:%M:%S")
    file_handler = RotatingFileHandler("/var/log/save_db.log", maxBytes=16777216, backupCount=3)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger

class SaveDB:

    def __init__(self):
        self.logger = my_logger(__name__)

        self.source_path = "db.json"
        self.dest_path = "db_save.json"
        self.last_date = None
        self.next_date = None
        self.is_running = False

    def run(self):
        self.logger.info("Backup Service Started")
        while True:
            if self.last_date is None:
                self.set_date()
            
            current_time = datetime.datetime.now()
            delta = current_time - self.last_date

            if delta.seconds >= 60 and not self.is_running:
                self.is_running = True
                self.logger.info("### new check ###")
                self.save_db()
                self.is_running = False

            time.sleep(1)
            print(delta.seconds)

    def set_date(self):
        self.last_date = datetime.datetime.now()

    def save_db(self):
        try:
            if os.path.isfile("db_save.json"):
                self.logger.info("Creating backup from old backup file")
                os.system("mv db_save.json db_save.json.bak")
                self.logger.info("backup file created")
            self.logger.info("copy actual DB file")
            shutil.copyfile(self.source_path, self.dest_path)
            self.logger.info("copy successfully")
            time.sleep(2)
            self.set_date()
            if os.path.isfile("db_save.json.bak"):
                self.logger.info("remove old backup file")
                os.system("rm db_save.json.bak")
                self.logger.info("remove successfully")

            
        except shutil.SameFileError:
            self.logger.error("Source and destination represents the same file.")

        except IsADirectoryError:
            os.system("mv db_save.json.bak db_save.json")
            self.logger.error("Destination is a directory.")

        except PermissionError:
            os.system("mv db_save.json.bak db_save.json")
            self.logger.error("Permission denied.")

        except:
            os.system("mv db_save.json.bak db_save.json")
            self.logger.error("Error occurred while copying file.")
        finally:
            time.sleep(3)
            sub = subprocess.Popen("git status", shell=True, stdout=subprocess.PIPE)
            sub_return = sub.stdout.read()
            self.logger.info("check for changes")
            if "db_save.json" in sub_return.decode("utf-8"):
                test = subprocess.Popen("git add db_save.json", shell=True, stdout=subprocess.PIPE)
                out, err = test.communicate()
                self.logger.info(out.decode("utf-8"))
                if test:
                    test2 = subprocess.Popen("git commit -m 'Save Changes From DB-Json'", shell=True, stdout=subprocess.PIPE)
                    out, err = test2.communicate()
                    if out:
                        self.logger.info(out.decode("utf-8"))
                    else: self.logger.error(err)
                    subprocess.check_output("git push")

            else:
                self.logger.info("### no changes found ###")

if __name__ == '__main__':
    SaveDB().run()
