Set sh = CreateObject("Wscript.Shell")
sh.Run "D:\Python\python.exe -m http.server 8137 --bind 127.0.0.1 --directory ""C:\Users\Vte\Documents\New project\public""", 0, False
