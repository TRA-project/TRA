import os

'''
用于清楚checkout后残留的.pyc文件和相应目录
'''

# 填写目标目录（相对于该项目根目录）
target_dir = "backend"

# 目录配置
root_path = os.path.join(os.getcwd(), "..")
work_path = os.path.join(root_path, target_dir)
print("working path:", work_path)

def rm_pyc(path):
    for file in os.listdir(path):
        abspath = os.path.join(path, file)
        if os.path.isdir(abspath):
            rm_pyc(abspath)
        elif str(file).endswith(".pyc"):  # 删除.pyc文件
            os.remove(abspath)
            print("rm", abspath)


def rm_empty_dir(path):
    for file in os.listdir(path):
        abspath = os.path.join(path, file)
        if os.path.isdir(abspath):
            rm_empty_dir(abspath)
    if not os.listdir(path):    # 删除空白目录
        os.rmdir(path)
        print("rm", path)
        

if __name__ == "__main__":
    rm_pyc(work_path)
    rm_empty_dir(work_path)


# 递归删除空白目录
# for root, dirs, files in os.walk(path, topdown=False):
#     print("a walk")
#     print(root, dirs, files)
#     if not dirs and not files:
#         os.rmdir(root)
#         print("rm", root)
#     print("---------------")
