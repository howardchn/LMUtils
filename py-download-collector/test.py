import threadingUtils

httpVerb = 'GET'
resourcePath = '/setting/collectors'
queryParams = '?fields=id,build,ea'
data = ''

download_uri = 'https://qauat.logicmonitor.com/santaba/rest/setting/collector/collectors/512/bootstraps/linux32?collectorVersion=26131&token=07B5421EA462182998826921904DE5D04C51F340&collectorSize=nano&v=2'
download_folder = '/Users/howard/Desktop'

threads = []
for i in range(1, 11):
    dwThread = threadingUtils.DownloadThread(download_uri, download_folder, i)
    threads.append(dwThread)
    dwThread.start()

for t in threads:
    t.join()

print('Download completed.')
