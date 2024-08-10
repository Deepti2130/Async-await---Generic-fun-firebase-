const cl = console.log;
const moviecontainer = document.getElementById("moviecontainer");
const backdrop = document.getElementById("backdrop");
const movieModel = document.getElementById("movieModel");
const addmoviebtn = document.getElementById("addmoviebtn");
const movieClose = [...document.querySelectorAll(".movieClose")];
const movieform = document.getElementById("movieform");
const titleControls = document.getElementById("title");
const movieurlControls = document.getElementById("movieurl");
const contentControls = document.getElementById("content");
const ratingControls = document.getElementById("movierating");
const submitbtn = document.getElementById("submitbtn");
const updatebtn = document.getElementById("updatebtn");
const loader = document.getElementById("loader");

 


const BASE_URL = `https://movie-model-ca2cc-default-rtdb.asia-southeast1.firebasedatabase.app/`

const MOVIE_URL = `${BASE_URL}/movie.json`

let movieArr = [];

const sweetalert = (msg, iconstr)=>{
    swal.fire({
        title:msg,
        timer:2000,
        icon:iconstr
    })  
}



const toggleModalBackdrop = () => {
  backdrop.classList.toggle(`visible`);
  movieModel.classList.toggle(`visible`);
  updatebtn.classList.add(`d-none`);
  submitbtn.classList.remove(`d-none`);

  movieform.reset();
};

movieClose.forEach((btn) => {
  btn.addEventListener("click", toggleModalBackdrop);
});



const createMovieCards = (arr) => {
  moviecontainer.innerHTML = arr.map(movie=> {

    return `<div class="col-md-4 mb-4 mb-md-0">
                   <div class="card mb-4 movieCard" id="${movie.id}">                   
                        <figure class="m-0">
                            <img src=${movie.movieurl} alt="">
                        
                            <figcaption>
                               <div class="figcapinfo">
                                <h3>${movie.title}</h3>
                                <strong>Rating:${movie.movierating}/5</strong>
                                <p>
                                ${movie.content}
                                </p>
                                </div>
                                <div>
                                    <button class="btn btn-sm btn-light" onclick="onMovieEdit(this)">
                                     Edit
                                    </button>
                                    <button class="btn btn-sm nfx-btn text-white" onclick="onMovieRemove(this)">
                                      Remove
                                    </button>
                                 </div>
                            </figcaption> 
                            
                        
                        </figure>
                                                                  
                        </div>
                    </div>`

  }).join("");

};



  const makeApiCall = (methodName, api_url, msgBody)=>{
    loader.classList.remove(`d-none`)
     return new Promise ((resolve,reject) =>{
        let xhr = new XMLHttpRequest();

        xhr.open(methodName, api_url)

        xhr.onload = function(){
            if(xhr.status >= 200 && xhr.status < 300){
             let data = JSON.parse(xhr.response);
             resolve(data)
            }else{
                reject(`something went wrong !!!`)
            }
            // loader.classList.add(`d-none`)
        }
        xhr.onerror = function(){
            loader.classList.add(`d-none`)
        }
       
        xhr.send(JSON.stringify(msgBody))

    })
}


//GET data from Backend
const fetchmovies = async () => {
 
 let movieobj= await makeApiCall("GET", MOVIE_URL);
//  cl(movieobj)
     

    let movieArr = [];
    for (const key in movieobj) {
       movieArr.push({...movieobj[key], id : key})
        
      }
      // cl(movieArr)
      createMovieCards(movieArr)
      loader.classList.add(`d-none`)
    }

  fetchmovies()



 const onAddmovie = async(eve) => {
  eve.preventDefault();
  let newmovieobj = {
    title:titleControls.value,
    movieurl:movieurlControls.value,
    content:contentControls.value,
    movierating:ratingControls.value 
  }

  //API call to store new movie

  try{
    let res = await makeApiCall("POST", MOVIE_URL,newmovieobj);
  // cl(res)
  //callback function => movie card create in UI
  newmovieobj.id = res.name;
  let div = document.createElement("div");
  div.className = `col-md-4 mb-4 mb-md-0`;
  div.innerHTML = `<div class="card mb-4 movieCard" id="${newmovieobj.id}">                   
                        <figure class="m-0">
                            <img src=${newmovieobj.movieurl} alt="">
                        
                            <figcaption>
                               <div class="figcapinfo">
                                <h3>${newmovieobj.title}</h3>
                                <strong>Rating:${newmovieobj.movierating}/5</strong>
                                <p>
                                ${newmovieobj.content}
                                </p>
                                </div>
                                <div>
                                    <button class="btn btn-sm btn-light" onclick="onMovieEdit(this)">
                                     Edit
                                    </button>
                                    <button class="btn btn-sm nfx-btn text-white" onclick="onMovieRemove(this)">
                                      Remove
                                    </button>
                                 </div>
                            </figcaption> 
                            
                        
                        </figure>
                                                                  
                        
                    </div>`
                    moviecontainer.append(div);
                    sweetalert(`${newmovieobj.title} is added successfully`, "success")

  }
  catch(err){
     sweetalert(err, "error")
  }
  finally{
    toggleModalBackdrop();
    movieform.reset()
    loader.classList.add(`d-none`)
  }

  
 }

 const onMovieEdit = async (ele) =>{
  // toggleModalBackdrop()
  try{
  //EditId
  let editId = ele.closest(`.card`).id;
  // cl(editId)

  localStorage.setItem("editId", editId);

  //Edit URL

  let EDIT_URL = `${BASE_URL}/movie/${editId}.json`

  //API call to patch the data
  let res = await makeApiCall("GET", EDIT_URL);
  cl(res)

  //callback fun => patch the data in form
  titleControls.value = res.title;
  movieurlControls.value = res.movieurl;
  contentControls.value = res.content;
  ratingControls.value = res.movierating;
  }catch(err){
    sweetalert(err, "error")
  }
  finally{
    loader.classList.add(`d-none`)
    updatebtn.classList.remove(`d-none`);
    submitbtn.classList.add(`d-none`);
  }
 }

 const onUpdatemovie = async() =>{
  try{
    //updatedId
  let updateId = localStorage.getItem("editId");
  cl(updateId)

  //updatedURL

  let UPDATE_URL = `${BASE_URL}/movie/${updateId}.json`;

  //updatedobj

  let updatedobj = {
    title:titleControls.value,
    movieurl:movieurlControls.value,
    content:contentControls.value,
    movierating:ratingControls.value 
  }

  //API call to update data
  let res = await makeApiCall("PATCH", UPDATE_URL, updatedobj)
  // cl(res)
  //callback functionality
  
  let card = document.getElementById(updateId);
  // cl(card);
  card.innerHTML=`<figure class="m-0">
                            <img src=${updatedobj.movieurl} alt="">
                        
                            <figcaption>
                            <div class="figcapinfo">
                                <h3>${updatedobj.title}</h3>
                                <strong>Rating:${updatedobj.movierating}/5</strong>
                                <p>
                                ${updatedobj.content}
                                </p>
                                </div>
                                <div>
                                    <button class="btn btn-sm btn-light" onclick="onMovieEdit(this)">
                                     Edit
                                    </button>
                                    <button class="btn btn-sm nfx-btn text-white" onclick="onMovieRemove(this)">
                                      Remove
                                    </button>
                                 </div>
                            </figcaption> 
                            
                        
                        </figure>`
                        sweetalert(`${updatedobj.title} is updated successfully`, "success")
  }
  catch(err){
    sweetalert(err, "error")
  }
  finally{
    toggleModalBackdrop();
    movieform.reset()
    updatebtn.classList.add(`d-none`);
    submitbtn.classList.remove(`d-none`);
    loader.classList.add(`d-none`)
  }
  
 }

 const onMovieRemove = async (ele) =>{

  try{
    let getconfirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this card!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!"
    });
    if(getconfirm.isConfirmed){
    //Remove ID
    let RemoveId = ele.closest(`.card`).id;
    // cl(RemoveId)
    //Remove URL

    let REMOVE_URL = `${BASE_URL}/movie/${RemoveId}.json`

  //API call
  
    let res = await makeApiCall("DELETE", REMOVE_URL)
    ele.closest(`.card`).parentElement.remove()
    }
  }
  catch(err){
    sweetalert(err, "error")
  }
  finally{
    loader.classList.add(`d-none`)
  }   
}
    
  
  
   
  

 









  movieform.addEventListener("submit", onAddmovie);
  addmoviebtn.addEventListener("click", toggleModalBackdrop);
  updatebtn.addEventListener("click", onUpdatemovie);
















// let movieArr = JSON.parse(localStorage.getItem("movieArr")) || [];

// if (movieArr.length > 0) {
//   createMovieCards(movieArr);
// }

// const toggleModalBackdrop = () => {
//   backdrop.classList.toggle(`visible`);
//   movieModel.classList.toggle(`visible`);
//   updatebtn.classList.add(`d-none`);
//   submitbtn.classList.remove(`d-none`);

//   movieform.reset();
// };

// const onMovieRemove = (ele)=>{
//     Swal.fire({
//         title: "Do you want to remove this movie?",
//         showCancelButton: true,
//         confirmButtonText: "Remove",
//         confirmButtonColor: "#e50914",
//         cancelButtonColor: "#000",
        
//       }).then((result) => {
//         /* Read more about isConfirmed, isDenied below */
//         if (result.isConfirmed) {
//             let removeId = ele.closest('.movieCard').id;
//             cl(removeId)

//             //remove from array
//             let getIndex = movieArr.findIndex(movie=> movie.movieId===removeId);

//             movieArr.splice(getIndex,1);

//             //remove from LS
//             localStorage.setItem("movieArr",JSON.stringify(movieArr));

//             //remove from UI
//             ele.closest('.movieCard').parentElement.remove();

//             swal.fire({
//                 title:`Movie removed successfully`,
//                 timer:2500,
//                 icon:'success'
//             })
//         } 
//       });
    
// }

// const onMovieEdit = (ele) => {
//   toggleModalBackdrop();
//   let editId = ele.closest('.movieCard').id;
//   cl(editId);
//   localStorage.setItem("editmovieId", editId);
//   updatebtn.classList.remove(`d-none`);
//   submitbtn.classList.add(`d-none`);

//   let editMovieObj = movieArr.find((movie) => movie.movieId === editId);

//   titleControls.value = editMovieObj.title;
//   movieurlControls.value = editMovieObj.movieurl;
//   contentControls.value = editMovieObj.content;
//   ratingControls.value = editMovieObj.rating;
// };

// const onmovieAdd = (eve) => {
//   eve.preventDefault();
//   let movieObj = {
//     title: titleControls.value,
//     movieurl: movieurlControls.value,
//     content: contentControls.value,
//     rating: ratingControls.value,
//     movieId: generateUuid(),
//   };
//   cl(movieObj);
//   movieform.reset();
//   movieArr.unshift(movieObj);
//   localStorage.setItem("movieArr", JSON.stringify(movieArr));
//   // createMovieCards(movieArr);
//   toggleModalBackdrop();

//   swal.fire({
//     title: `New movie ${movieObj.title}is added successfully!!!`,
//     timer: 2500,
//     icon: "success",
//   });

//   //we will create a new card for new movie object

//   let div = document.createElement("div");

//   div.className = "col-md-4";

//   div.innerHTML = `<div class="card movieCard" id="${movieObj.movieId}">                   
//                         <figure class="m-0">
//                             <img src=${movieObj.movieurl} alt="">
                        
//                             <figcaption>
//                                 <h3>${movieObj.title}</h3>
//                                 <strong>Rating:${movieObj.rating}/5</strong>
//                                 <p>
//                                 ${movieObj.content}
//                                 </p>
//                                 <div>
//                                     <button class="btn btn-sm btn-light" onclick="onMovieEdit(this)">
//                                      Edit
//                                     </button>
//                                     <button class="btn btn-sm nfx-btn text-white" onclick="onMovieRemove(this)">
//                                       Remove
//                                     </button>
//                                  </div>`;

//   moviecontainer.prepend(div);
// };

// movieClose.forEach((btn) => {
//   btn.addEventListener("click", toggleModalBackdrop);
// });

// const onupdatemovie = () => {
//   //updateId

//   let updatemovieId = localStorage.getItem("editmovieId");
//   //updateobj

//   let updatemovieObj = {
//     title: titleControls.value,
//     movieurl: movieurlControls.value,
//     content: contentControls.value,
//     rating: ratingControls.value,
//     movieId: updatemovieId,
//   };

//   cl(updatemovieObj);

//   let getIndex = movieArr.findIndex(movie => movie.movieId===updatemovieId);

//   movieArr[getIndex] = updatemovieObj;

//   localStorage.setItem("movieArr", JSON.stringify(movieArr));

  // let getMovieCard = document.getElementById(updatemovieId);

  // getMovieCard.innerHTML=`<figure class="m-0">
  //                           <img src=${updatemovieObj.movieurl} alt="">
                        
  //                           <figcaption>
  //                               <h3>${updatemovieObj.title}</h3>
  //                               <strong>Rating:${updatemovieObj.rating}/5</strong>
  //                               <p>
  //                               ${updatemovieObj.content}
  //                               </p>
  //                               <div>
  //                                   <button class="btn btn-sm btn-light" onclick="onMovieEdit(this)">
  //                                    Edit
  //                                   </button>
  //                                   <button class="btn btn-sm nfx-btn text-white" onclick="onMovieRemove(this)">
  //                                     Remove
  //                                   </button>
  //                                </div>
  //                           </figcaption> 
                            
                        
  //                       </figure>`

//   toggleModalBackdrop();
// }

// addmoviebtn.addEventListener("click", toggleModalBackdrop);
// movieform.addEventListener("submit", onmovieAdd);
// updatebtn.addEventListener("click", onupdatemovie);
