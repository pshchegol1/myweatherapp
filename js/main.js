window.addEventListener('load',function(e)
{
    const form = document.querySelector('form');
    const error = document.querySelector('.error');

    
  

      form.addEventListener('submit', (e)=>{


       
        e.preventDefault();

        const city = document.querySelector('#city').value.trim();

        console.log(city);



        //Validation
        if(city === "")
        {
            error.classList.remove('error');
            error.innerHTML = "Enter City Please!";
        
            form.reset();
            
        }
        else
        {
            fetch(`https://weatherdbi.herokuapp.com/data/weather/${city}`)
            .then((data)=>{
                return data.json();
            })
            .then(function(data){

                if(data.status ==="503")
                {
                    alert("503 Service Unavailable at the moment, please check later.")
                }

                if(data["status"])
                {
                    error.classList.remove('error');
                    error.innerHTML = "Incorect City!";
                
                    form.reset();
                }


               
       

                console.log(data);
                
                let output = '';
                
                let w = []
    
                w = [data]
    
            
    
                w.forEach(city => {
                    let dayhour = city["currentConditions"]["dayhour"]
                    let temp = city["currentConditions"]["temp"]["c"]
                    let humidity = city["currentConditions"]["humidity"]
                    let wind = city["currentConditions"]["wind"]["km"]
                    let iconURL = city["currentConditions"]["iconURL"]
                    output += `
    
    
    
    
    
                            <div class="card custom-card mb-3 mt-4 text-center">
                            <h3 class="card-header">Region: ${city.region}</h3>
       
                            <img class="icon-img text-center" src="${iconURL}" alt="">
    
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item"><span class="badge bg-info">Day Hour: ${dayhour}</span></li>
                                <li class="list-group-item"><span class="badge bg-info">Temperature ${temp}°C</span></li>
                                <li class="list-group-item"> <span class="badge bg-info">Humidity: ${humidity}</span></li>
                                <li class="list-group-item"> <span class="badge bg-info">Wind: ${wind} km</span></li>
                            </ul>
    
    
                            </div>
                    
                    `;
                });
                document.querySelector('.display-data').innerHTML = output;
               
                
            })
            .catch(function(err){console.log(err);})
            form.reset();
            error.classList.add('error');
           
        }

        

        


        
      
      })



    //   async function loadCity()
    //   {
    //     const city = document.querySelector('#city').value;
    //     const response = await fetch(`https://weatherdbi.herokuapp.com/data/weather/${city}`);
    //     const data = await response.json();
    //     return data
    //   }
})