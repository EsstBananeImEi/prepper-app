import subprocess
import os

if __name__ == '__main__':
    # change dir to Prepper App Path
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    command = ["yarn", "start"]
    try:
        subprocess.check_output(command)
    except Exception as ex:
        print(ex)