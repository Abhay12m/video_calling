/**
 * @author Amir Sanni <amirsanni@gmail.com>
 * @date 6th January, 2020
 */
import h from './helpers.js';

window.addEventListener('load', ()=>{
    const room = h.getQString(location.href, 'room');
    const username = sessionStorage.getItem('username');

    if(!room){
        document.querySelector('#room-create').attributes.removeNamedItem('hidden');
    }

    else if(!username){
        document.querySelector('#username-set').attributes.removeNamedItem('hidden');
    }

    else{
        let commElem = document.getElementsByClassName('room-comm');

        for(let i = 0; i < commElem.length; i++){
            commElem[i].attributes.removeNamedItem('hidden');
        }

        var pc = [];

        let socket = io('/stream');

        var socketId = '';
        var myStream = '';

        socket.on('connect', ()=>{
            //set socketId
            socketId = socket.io.engine.id;
        

            socket.emit('subscribe', {
                room: room,
                socketId: socketId
            });


            socket.on('new user', (data)=>{
                socket.emit('newUserStart', {to:data.socketId, sender:socketId});
                pc.push(data.socketId);
                init(true, data.socketId);
            });


            socket.on('newUserStart', (data)=>{
                pc.push(data.sender);
                init(false, data.sender);
            });


            socket.on('ice candidates', async (data)=>{
                data.candidate ? await pc[data.sender].addIceCandidate(new RTCIceCandidate(data.candidate)) : '';
            });


            socket.on('sdp', async (data)=>{
                if(data.description.type === 'offer'){
                    data.description ? await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description)) : '';

                    h.getUserMedia().then(async (stream)=>{
                        if(!document.getElementById('local').srcObject){
                            document.getElementById('local').srcObject = stream;
                        }

                        //save my stream
                        myStream = stream;

                        stream.getTracks().forEach((track)=>{
                            pc[data.sender].addTrack(track, stream);
                        });

                        let answer = await pc[data.sender].createAnswer();
                        
                        await pc[data.sender].setLocalDescription(answer);

                        socket.emit('sdp', {description:pc[data.sender].localDescription, to:data.sender, sender:socketId});
                    }).catch((e)=>{
                        console.error(e);
                    });
                }

                else if(data.description.type === 'answer'){
                    await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description));
                }
            });


            socket.on('chat', (data)=>{
                h.addChat(data, 'remote');
            })
        });


        function sendMsg(msg){
            let data = {
                room: room,
                msg: msg,
                sender: username
            };

            //emit chat message
            socket.emit('chat', data);


            //add localchat
            h.addChat(data, 'local');
        }



        function init(createOffer, partnerName){
            pc[partnerName] = new RTCPeerConnection(h.getIceServer());
            
            h.getUserMedia().then((stream)=>{
                //save my stream
                myStream = stream;

                stream.getTracks().forEach((track)=>{
                    pc[partnerName].addTrack(track, stream);//should trigger negotiationneeded event
                });
		//change local stream to captured screen
		
                document.getElementById('local').srcObject = stream;
                // document.getElementById("if2").style.visibility = "visible";
                // document.getElementById("if1").style.visibility = "hidden";
		
            }).catch((e)=>{
                console.error(`stream error: ${e}`);
            });



            //create offer
            if(createOffer){
                pc[partnerName].onnegotiationneeded = async ()=>{
                    let offer = await pc[partnerName].createOffer();
                    
                    await pc[partnerName].setLocalDescription(offer);

                    socket.emit('sdp', {description:pc[partnerName].localDescription, to:partnerName, sender:socketId});
                };
            }



            //send ice candidate to partnerNames
            pc[partnerName].onicecandidate = ({candidate})=>{
                socket.emit('ice candidates', {candidate: candidate, to:partnerName, sender:socketId});
            };



            //add
            pc[partnerName].ontrack = (e)=>{
		
                let str = e.streams[0];
                

                // if(str == e.streams[0])
                // {
                //     document.getElementById("if2").style.visibility = "hidden";
                //     document.getElementById("if1").style.visibility = "visible";
                // }
                // else{
                //     document.getElementById("if1").style.visibility = "hidden";
                //     document.getElementById("if2").style.visibility = "visible";
                // }
                
                if(document.getElementById(`${partnerName}-video`)){
                    document.getElementById(`${partnerName}-video`).srcObject = str;
                    
                }

                else{
                    //video elem
                    //document.getElementById("if1").style.visibility = "hidden";
                    //document.getElementById("if2").style.visibility = "visible";
                    let newVid = document.createElement('video');
                    newVid.id = `${partnerName}-video`;
		   
                    newVid.srcObject = str;
		    
                    newVid.autoplay = true;
		            newVid.controls = true;
			    newVid.muted = true;
                    newVid.className = 'remote-video';
		    //newVid.style.height = "100%";
                    
                    //create a new div for card
                    let cardDiv = document.createElement('div');
                    cardDiv.className = 'card mb-3';
		    //cardDiv.style.height = "100%";
		    //cardDiv.style.width = "80%";
		    //cardDiv.style.position = "fixed";
		    //cardDiv.style.top = "60px";
                    let fullscreen = document.createElement('button');
                    fullscreen.className = 'button-full-screen';
                    fullscreen.innerText = 'Full Screen';
		    
                    
                    cardDiv.appendChild(newVid);
                    
                    
                    //create a new div for everything
                    let div = document.createElement('div');
                    div.className = 'col-sm-12';
                    // div.style.maxWidth = '25%'; col-md-6;
                    div.id = partnerName;
                    div.appendChild(cardDiv);
		    let resize	= document.createElement('button');
			resize.className = 'button-resize-screen';
			resize.innerText = 'Resize Screen';
                    div.appendChild(fullscreen);
		    div.appendChild(resize);
		   
		    resize.style.visibility = 'hidden';
            fullscreen.style.visibility = 'hidden';

			    
                    fullscreen.addEventListener("click", function () {
                        if (newVid.id == `${partnerName}-video`) {
				
                            newVid.className = 'rm-video';
			    div.className = 'divmax-width';
				//document.getElementById("divfull").appendChild(div);
				//document.getElementById("divfull").appendChild(resize);
			   
			    
					  fullscreen.style.visibility = 'hidden';
                            		  resize.style.visibility = 'visible';
					  
				
                            //var win = window.open("", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400");
                           // win.document.appendChild(newVid);
                        }
                    }, false);

		    resize.addEventListener("click", function () {
		    	 if (newVid.id == `${partnerName}-video`) {
                            newVid.className = 'remote-video';
			    div.className = 'col-sm-12 col-md-6';
			    fullscreen.style.visibility = 'visible';
                            resize.style.visibility = 'hidden';
			}
		    }, false);                      
                    //put div in videos elem
                    document.getElementById('videos').appendChild(div);
                }
            };



            pc[partnerName].onconnectionstatechange = (d)=>{
                switch(pc[partnerName].iceConnectionState){
                    case 'disconnected':
                    case 'failed':
                        h.closeVideo(partnerName);
                        break;
                        
                    case 'closed':
                        h.closeVideo(partnerName);			
                        break;
                }
            };



            pc[partnerName].onsignalingstatechange = (d)=>{
                switch(pc[partnerName].signalingState){
                    case 'closed':
                        console.log("Signalling state is 'closed'");
                        h.closeVideo(partnerName);
                        break;
                }
            };
        }


        //document.getElementById('chat-input').addEventListener('keypress', (e)=>{
            //if(e.which === 13 && (e.target.value.trim())){
               // e.preventDefault();
                
                //sendMsg(e.target.value);

               // setTimeout(()=>{
                   // e.target.value = '';
               // }, 50);
           // }
       // });


        document.getElementById('toggle-video').addEventListener('click', (e)=>{
            e.preventDefault();

            myStream.getVideoTracks()[0].enabled = !(myStream.getVideoTracks()[0].enabled);

            //toggle video icon
            e.srcElement.classList.toggle('fa-video');
            e.srcElement.classList.toggle('fa-video-slash');
        });


        document.getElementById('toggle-mute').addEventListener('click', (e)=>{
            e.preventDefault();

            myStream.getAudioTracks()[0].enabled = !(myStream.getAudioTracks()[0].enabled);

            //toggle audio icon
            e.srcElement.classList.toggle('fa-volume-up');
            e.srcElement.classList.toggle('fa-volume-mute');
        });
    }
});