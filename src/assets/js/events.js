import helpers from './helpers.js';

window.addEventListener('load', ()=>{
    //When the chat icon is clicked
    //document.querySelector('#toggle-chat-pane').addEventListener('click', (e)=>{
       // document.querySelector('#chat-pane').classList.toggle('chat-opened');

        //remove the 'New' badge on chat icon (if any) once chat is opened.
        //setTimeout(()=>{
           // if(document.querySelector('#chat-pane').classList.contains('chat-opened')){
             //   helpers.toggleChatNotificationBadge();
            //}
      //  }, 300);
	let qstring = window.location.href.split('?')[1];
	let doc1 = qstring.split('=')[1];
	let u_name;
	//var n = doc1.length;
	var dn = doc1.includes("_");
	if(dn == false)
	{
	u_name = "Dr. " + doc1;
	}
	else
	{
	let doc2 = doc1.split('_')[0];
	u_name = "Dr. " + doc2;
	}
	document.getElementById('dr_user').innerHTML = u_name; 


    });


    //When the video frame is clicked. This will enable picture-in-picture
    document.getElementById('local').addEventListener('click', ()=>{
        if (!document.pictureInPictureElement) {
            document.getElementById('local').requestPictureInPicture()
            .catch(error => {
                // Video failed to enter Picture-in-Picture mode.
                console.error(error);
            });
        } 
          
        else {
            document.exitPictureInPicture()
            .catch(error => {
                // Video failed to leave Picture-in-Picture mode.
                console.error(error);
            });
        }
    });


    //When the 'Create room" is button is clicked
    document.getElementById('create-room').addEventListener('click', (e)=>{
        e.preventDefault();
	
	let qstring = window.location.href.split('?')[1];
	let doc_value = qstring.split('&')[0];
	let pid_value = qstring.split('&')[1];
	let doc = doc_value.split('=')[1];
	let pid = pid_value.split('=')[1];
        let roomName = doc;//document.querySelector('#room-name').value;
        let yourName = doc;//document.querySelector('#your-name').value;

        //if(roomName && yourName){
            //remove error message, if any
            document.querySelector('#err-msg').innerHTML = "";

            //save the user's name in sessionStorage
            sessionStorage.setItem('username', yourName);

            //create room link
            let roomLink = `${location.origin}?room=${roomName.trim().replace(' ', '_')}_${helpers.generateRandomString()}`;

            //show message with link to room
            //document.querySelector('#room-created').innerHTML = `Room successfully created. Click <a href='${roomLink}'>here</a> to enter room. 
                //Share the room link with your partners.`;
	        document.getElementById("link-header").innerHTML = roomLink;

            function downloadasTextFile(filename, text) {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            }
            var header = document.getElementById("link-header");
            var text = header.innerText;
            var filename = "GetLink.txt";

            downloadasTextFile(filename, text);
            //empty the values
            //document.querySelector('#room-name').value = '';
            //document.querySelector('#your-name').value = '';
		//alert(pid);
            window.location.href = "https://192.168.0.105/SendLink.aspx?rl=" + roomLink + "&p_id=" + pid; //"https://103.83.137.12/SelectDept.aspx?room=" +
        //}

        //else{
           // document.querySelector('#err-msg').innerHTML = "All fields are required";
        //}
    });


    //When the 'Enter room' button is clicked.
    document.getElementById('enter-room').addEventListener('click', (e)=>{
        e.preventDefault();

        let name = "patient";//document.querySelector('#username').value;
	document.getElementById('dr_user').innerHTML = name; 
        if(name){
            //remove error message, if any
            //document.querySelector('#err-msg-username').innerHTML = "";

            //save the user's name in sessionStorage
            sessionStorage.setItem('username', name);

            //reload room
            location.reload();
        }

        else{
            //document.querySelector('#err-msg-username').innerHTML = "Please input your name";
        }
    });
//})