import datetime
import os
import time
import shutil
import subprocess

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class SaveDB:

    def __init__(self):
        self.source_path = "db.json"
        self.dest_path = "db_save.json"
        self.last_date = None
        self.next_date = None

    def run(self):
        while True:
            if self.last_date is None:
                self.set_date()
            
            current_time = datetime.datetime.now()
            delta = current_time - self.last_date

            if delta.seconds >= 10:
                self.save_db()
            time.sleep(1)
            print(delta.seconds)

    def set_date(self):
        self.last_date = datetime.datetime.now()

    def save_db(self):
        try:
            if os.path.isfile("db_save.json"):
                os.system("mv db_save.json db_save.json.bak")
            shutil.copyfile(self.source_path, self.dest_path)
            print("copy file successfully")
            self.set_date()
            if os.path.isfile("db_save.json.bak"):
                print("remove backup file")
                os.system("rm db_save.json.bak")
            
            sub = subprocess.Popen("git status", shell=True, stdout=subprocess.PIPE)
            sub_return = sub.stdout.read()
            if not "Your branch is up to date" in sub_return:
                os.system(f"git add db_save.json && git commit -m 'db save ${self.last_date}' && git push")

        except shutil.SameFileError:
            print("Source and destination represents the same file.")

        except IsADirectoryError:
            os.system("mv db_save.json.bak db_save.json")
            print("Destination is a directory.")

        except PermissionError:
            os.system("mv db_save.json.bak db_save.json")
            print("Permission denied.")

        except:
            os.system("mv db_save.json.bak db_save.json")
            print("Error occurred while copying file.")


if __name__ == '__main__':
    SaveDB().run()
