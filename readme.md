From provided link you can find a ZIP file of videos with their metadata.
Each videofile consists of approximately 200 frames of video. 
Filenames are organized based on videos first frame timestamp and camera name (5 in total).
Each line in .meta file is a timestamp of a corresponding frame in a video with the same base name.

Please construct a video player that will:
- display all five cameras and construct most comfortable and ergonomic view in your opinion to an supervisor
- please consider that front_camera should be displayed in a more prominent way and probably 1.5x bigger than other cameras
- be in sync - all cameras must display video from same timestamp (+-5 milliseconds)
- make it possible to change framerate
- be on time - if user has chosen 4fps then the videos must play 4fps
- load fast - start the playback before all data is downloaded, lazy loading
- do not overload CPU

To finish the task, you also need to construct mini-server to serve the files from. You can choose the technology behind it but I recommend NodeJS stack.

You *can not* alter the files or convert them in any way.
You *can not* use flash or stock `<video>` tag.

You *can* use some third party components where needed but you *must* understand and explain how it works.

In case you have any questions, please don't hesitate to ask.


found:

https://github.com/defunctzombie/Broadway

https://github.com/131/h264-live-player

https://strukturag.github.io/libde265.js/



uses video  tag inside 

https://github.com/Stanko/html-canvas-video-player
