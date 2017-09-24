

let ethHashesRead = [];
let ethTransactions = [];
let updateTimer = 0;

let circles = [];

let latestBlockId = 0;

let number_of_tx_added_this_poll = 0;
let tx_offset = 0;


var two;


function pollTransactions()
{

  $.ajax({
    url: "https://etherchain.org/api/txs/"+tx_offset+"/100"
  })
    .done(function( response ) {

      tx_offset++;
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

              if(blockId >= latestBlockId && !ethHashesRead.includes(hash))
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


    //  let tx_data = JSON.parse(html)
      //    console.log(tx_data)




    });






}


let delay_multiplier = 0;

function renderTransactions()
{

  if(delay_multiplier > 0)
  {
    delay_multiplier--;
    return;
  }


  $(".latest-block-id").html(latestBlockId)
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



  var x = Math.random() * two.width;
  var y = 10;
  var size = Math.sqrt(tx.amount / 100000000000000000);

//gasUsed
//amount


  console.log(tx)

  var circle = two.makeCircle(x,y,size);

  var color = randomColor();

  circle.fill = color;

  //circlegroup.add(circle);

  while(circles.length >= 500)
  {
      var removed_circle = circles.pop(circle)
  }

    circles.push(circle)


  two.update();





}

/*
  // Make an instance of two and place it on the page.
 var elem = document.getElementById('two-container');
 var params = { width: 285, height: 200 };
 var two = new Two(params).appendTo(elem);

 // two has convenience methods to create shapes.
 var rect = two.makeRectangle(213, 100, 100, 100);


 rect.fill = 'rgb(0, 200, 255)';
 rect.opacity = 0.75;
 rect.noStroke();

 // Don't forget to tell two to render everything
 // to the screen
 two.update();

*/

}


var circlegroup;
var falling_height = 0;
$(document).ready(function(){

  pollTransactions()



      var el = document.getElementById("main");

        two = new Two({
            fullscreen: true
        });


    two.appendTo(el);

    circlegroup = two.makeGroup();


    setInterval(function(){   pollTransactions()   }, 5000);
    setInterval(function(){   renderTransactions()   }, 25);

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
        console.log(  circles[i].translation._x )
        circles[i].translation.set( circles[i].translation._x  , circles[i].translation._y + 1 );
      }



    }).play();  // Finally, start the animation loop



    var library = {
    	"select": {"Volume":{"Sustain":0.1,"Decay":0.15,"Punch":0.55}},
    	"long": {"Volume":{"Sustain":0.1,"Decay":0.5,"Punch":1}}
    };
    var sfx = jsfx.Sounds(library);
    sfx.long()

})
