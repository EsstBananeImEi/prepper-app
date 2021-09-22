import subprocess
import os
import threading


def start_json_server(cmd: list) -> None:
    subprocess.check_output(cmd)

def start_db_save_interval(cmd: list) -> None:
    subprocess.check_output(cmd)

if __name__ == '__main__':
    # change dir to json server Path
    os.chdir(os.path.abspath(os.sep.join([os.path.dirname( __file__ ),"json-server"] )))

    command = ["yarn", "start-ext"]
    command2 = ["python", "save_db.py"]
    try:
        thread1 = threading.Thread(target= start_json_server, args=(command,))
        thread2 = threading.Thread(target= start_db_save_interval, args=(command2,))
        thread1.start()
        thread2.start()
    except Exception as ex:
        print(ex)