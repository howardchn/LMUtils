import threading
import apiUtils


class DownloadThread(threading.Thread):
    def __init__(self, uri, folder_name, index):
        threading.Thread.__init__(self)
        self.uri = uri
        self.folder_name = folder_name
        self.index = index

    def run(self):
        apiUtils.download(self.uri, self.folder_name, self.index)
