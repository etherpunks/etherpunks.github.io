

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

  console.log(tx)

  var x = Math.random() * two.width;
  var y = 10;
  var size = 4 +  Math.sqrt(tx.amount / 100000000000000000);

//gasUsed
//amount



  if(tx.recipient == "0xa4ec8e283de9c77510cfedfa15719fb64b1cd9de")
  {
    var circle = two.makeStar(x,y,size*2,size*4,5);
    var color = "#000";
  }else{
    var circle = two.makeCircle(x,y,size);
    var color = randomColor();
  }



  circle.fill = color;
  circle.data = tx.hash;

  console.log(circle.id)

  //circlegroup.add(circle);

  while(circles.length >= 500)
  {
      var removed_circle = circles.pop(circle)
      two.remove(removed_circle);
  }

    circles.push(circle)


    two.update();

    $(circle._renderer.elem).data('hash', tx.hash)

    circle._renderer.elem.addEventListener('click', clickTXhandler, false);



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
         circles[i].translation.set( circles[i].translation._x  , circles[i].translation._y + 0.2 );
      }



    }).play();  // Finally, start the animation loop



    var library = {
    	"select": {"Volume":{"Sustain":0.1,"Decay":0.15,"Punch":0.55}},
    	"long": {"Volume":{"Sustain":0.1,"Decay":0.5,"Punch":1}}
    };
    var sfx = jsfx.Sounds(library);
    sfx.long()

})