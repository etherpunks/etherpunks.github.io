

let ethHashesRead = [];
let ethTransactions = [];
let updateTimer = 0;

let circles = [];

let latestBlockId = 0;

let number_of_tx_added_this_poll = 0;
let tx_offset = 0;

var muted = false;
var two;


var timeOfLastSound = 0;
var timeBetweenSounds = 200;

function pollTransactions()
{

  $.ajax({
    url: "https://etherchain.org/api/txs/"+tx_offset+"/100",
    success: function(response){


      tx_offset+=100;
      number_of_tx_added_this_poll = 0;


      console.log('read ')

          let tx_list = response.data;

            for (var i=0; i < tx_list.length; i++ )
            {
              let tx = response.data[i];

              let hash = tx.hash;

              let blockId = tx.block_id;

              if(latestBlockId < blockId)
              {
                latestBlockId = blockId;
              }

              //ethTransactions[hash] = tx;

              if( !ethHashesRead.includes(hash))
              {
                ethHashesRead.push(hash)

                ethTransactions.push(tx)

                  //console.log(hash)

                  number_of_tx_added_this_poll++;
              }

            }


            //if no transactions from this block were found then reset our offset
            if(number_of_tx_added_this_poll  == 0)
            {
              //reset tx_offset
              tx_offset = 0;

            }

            $(".debug-info").html(tx_offset)



      },
  error: function(XMLHttpRequest, textStatus, errorThrown) {
    tx_offset = 0;
    console.log('api failed -- resetting')
  }
  })



}


let delay_multiplier = 0;

function renderTransactions()
{

  if(delay_multiplier > 0)
  {
    delay_multiplier--;
    return;
  }

  if(latestBlockId > 0 )
  {

    $(".latest-block-id").html(latestBlockId)
  }

  $(".tx-queue-length").html(ethTransactions.length)
  //   ethTransactions.push(tx)



  if(ethTransactions.length > 0)
  {

    //as the eth tran length approaches 10, the adder goes to 0
    delay_adder = Math.abs( Math.ceil( 10 - Math.ceil(Math.min(ethTransactions.length,1000) / 100) ) )
    delay_multiplier += (Math.ceil ( Math.random() * delay_adder  )  + 0  )

    latest_tx_to_render = ethTransactions.pop();

      renderTransaction(latest_tx_to_render)

  }

}


function renderTransaction(tx)
{

if(typeof two != "undefined")
{



     var hash_beginning = tx.hash.substring(2,8)
     var hash_beginning_value = parseInt(hash_beginning, 16);


  var x = ((hash_beginning_value % 5000)/5000) * two.width;
  var y = 10;
  var size = 4 +  Math.sqrt(tx.amount / 100000000000000000);

//gasUsed
//amount

   var pitch = Math.max(40, 200 - size);


  if(tx.recipient == "0xa4ec8e283de9c77510cfedfa15719fb64b1cd9de")
  {
    var circle = two.makeStar(x,y,size*2,size*4,5);
    var color = "#000";
    if(!muted)
    {

          //play a middle 'C' for the duration of an 8th note
          synth.triggerAttackRelease(pitch, "8n");
    }

  }else{
    var circle = two.makeCircle(x,y,size);
    var color = "#" + hash_beginning;

    if(!muted)
    {
        beep.triggerRelease();
        beep.triggerAttackRelease(pitch, 2);
    //  plucky.triggerRelease();
    //  plucky.triggerAttackRelease(pitch, 4);

          if(  (new Date().getMilliseconds()-timeOfLastSound) > timeBetweenSounds)
          {

          //play a middle 'C' for the duration of an 8th note

            timeOfLastSound =   new Date().getMilliseconds()
          }



    }


  }



  circle.fill = color;
  circle.data = tx.hash;



  //circlegroup.add(circle);

  while(circles.length >= 500)
  {
      var removed_circle = circles.shift(circle)
      two.remove(removed_circle);
  }

    circles.push(circle)


    two.update();

    $(circle._renderer.elem).data('hash', tx.hash)

    circle._renderer.elem.addEventListener('click', clickTXhandler, false);



}

}

function clickTXhandler(elem)
{

  var target = elem.target;


 var target_node = elem.srcElement;

 clickedTxWithHash($(target_node).data('hash'))



}

function clickedTxWithHash(hash)
{

  var hash_start = hash.substring(0,14) + ".."
  $(".selectedTxInfo").html(hash_start);
  $(".selectedTxInfoLink").attr("href","http://etherscan.io/tx/"+hash)




}



function toggleMute()
{
  if(muted)
  {
    $(".mute-icon").removeClass("fa-volume-off");
    $(".mute-icon").addClass("fa-volume-up");
    muted = false;
  }else {
      $(".mute-icon").removeClass("fa-volume-up");
      $(".mute-icon").addClass("fa-volume-off");
    muted = true;
  }
}

var circlegroup;
var falling_height = 0;

var synth;
var bell;
var drum;
var bassPart;
var plucky;
var beep;

$(document).ready(function(){

  pollTransactions()



      var el = document.getElementById("main");

        two = new Two({
            fullscreen: true
        });


    two.appendTo(el);

    circlegroup = two.makeGroup();


    setInterval(function(){   pollTransactions()   }, 5000);
    setInterval(function(){   renderTransactions()   }, 30);

    var framecount = 1;
    two.bind('update', function(framecount) {
      // This code is called everytime two.update() is called.
      // Effectively 60 times per second.

      falling_height += 1;

      if(falling_height > two.height)
      {
        falling_height = 0;
      }


      for(var i=0;i< circles.length; i++)
      {
         circles[i].translation.set( circles[i].translation._x  , circles[i].translation._y + 0.2 + (0.1 * Math.random()) );
      }



    }).play();  // Finally, start the animation loop


    //create a synth and connect it to the master output (your speakers)
      synth = new Tone.DuoSynth({
			"vibratoAmount" : 0.5,
			"vibratoRate" : 5,
			"portamento" : 0.1,
			"harmonicity" : 1.005,
			"volume" : 5,
			"voice0" : {
				"volume" : -10,
				"oscillator" : {
					"type" : "sawtooth"
				},
				"filter" : {
					"Q" : 1,
					"type" : "lowpass",
					"rolloff" : -24
				},
				"envelope" : {
					"attack" : 0.01,
					"decay" : 0.25,
					"sustain" : 0.2,
					"release" : 1.2
				},
				"filterEnvelope" : {
					"attack" : 0.001,
					"decay" : 0.05,
					"sustain" : 0.3,
					"release" : 2,
					"baseFrequency" : 100,
					"octaves" : 4
				}
			},
			"voice1" : {
				"volume" : -20,
				"oscillator" : {
					"type" : "sawtooth"
				},
				"filter" : {
					"Q" : 2,
					"type" : "bandpass",
					"rolloff" : -12
				},
				"envelope" : {
					"attack" : 0.25,
					"decay" : 4,
					"sustain" : 0.1,
					"release" : 0.8
				},
				"filterEnvelope" : {
					"attack" : 0.05,
					"decay" : 0.05,
					"sustain" : 0.7,
					"release" : 2,
					"baseFrequency" : 5000,
					"octaves" : -1.5
				}
			}
		}).toMaster();







          plucky = new Tone.PluckSynth(
          {
      			"resonance" :0.9,
            "envelope" : {
              "attack" : 0.1,
            	"decay" : 0.2,
            	"sustain" : 0.8,
            	"release" : 0.7,
      			},
            "volume" : -15
          }
        ).toMaster();


        bell = new Tone.MetalSynth({
      			"harmonicity" : 12,
      			"resonance" : 800,
      			"modulationIndex" : 20,
      			"envelope" : {
      				"decay" : 0.4,
      			},
      			"volume" : -15
      		}).toMaster();

          drum = new Tone.MembraneSynth({
    			"pitchDecay" : 0.008,
    			"octaves" : 2,
    			"envelope" : {
    				"attack" : 0.0006,
    				"decay" : 0.5,
    				"sustain" : 0
    			}
    		}).toMaster();


      var synthA = new Tone.Synth({
        	oscillator : {
          	type : 'fmsquare',
            modulationType : 'sawtooth',
            modulationIndex : 3,
            harmonicity: 3.4
          },
          envelope : {
          	attack : 0.001,
            decay : 0.1,
            sustain: 0.1,
            release: 0.1
          }
        }).toMaster()

        var synthB = new Tone.Synth({
        	oscillator : {
          	type : 'triangle8'
          },
          envelope : {
          	attack : 2,
            decay : 1,
            sustain: 0.4,
            release: 4
          }
        }).toMaster()




})



    // ********* Tone.js stuff

     beep = new Tone.MonoSynth().toMaster();
    beep.volume.value = -40;

    // ********* NexusUI stuff

    nx.onload = function() {

    /*  monokeyboard.on('*', function(data) {
        if (data.on)
        {
          beep.triggerAttack(nx.mtof(data.note));
        }
        else
        {
          beep.triggerRelease();
        }
      });*/

      volumeslider.on('*', function(data) {
        beep.volume.value = data.value*20 -50; 
      });

      attackslider.on('*', function(data) {
        beep.envelope.attack = data.value * 4;
        beep.filterEnvelope.attack = data.value * 4;
      });

      decayslider.on('*', function(data) {
        beep.envelope.decay = data.value * 4;
        beep.filterEnvelope.decay = data.value * 4;
      });

      sustainslider.on('*', function(data) {
        beep.envelope.sustain = data.value;
        beep.filterEnvelope.sustain = data.value;
      });

      releaseslider.on('*', function(data) {
        beep.envelope.release = data.value * 14.0;
        beep.filterEnvelope.release = data.value * 14.0;
      });

      filterfreqslider.on('*', function(data) {
        beep.filter.frequency.value = data.value * 20000;
        console.log('moved slider ')
        console.log(beep.filter.frequency.value)
      });

      filterqslider.on('*', function(data) {
        beep.filter.Q.value = data.value * 10;
      });

      attackslider.set({
        value: 0.02,
      }, true);
      decayslider.set({
        value: 0.2,
      }, true);
      sustainslider.set({
        value: .5,
      }, true);
      releaseslider.set({
        value: 0.4,
      }, true);

      filterfreqslider.set({
        value: .5,
      }, true);
      filterqslider.set({
        value: 0.2,
      }, true);

    }
