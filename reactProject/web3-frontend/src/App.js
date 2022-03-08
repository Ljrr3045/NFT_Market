import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const data = [
  {
    id : "1",
    img : "https://ipfs.io/ipfs/QmUppT7rzGe5LhansP1qjyZnwyGUkhjAzNTmCqz4HyEqGs/1.png",
    price : "100",
    amount : "5",
    name : "NFT Collection by Ljrr3045"
  },
  {
    id : "2",
    img : "https://ipfs.io/ipfs/QmUppT7rzGe5LhansP1qjyZnwyGUkhjAzNTmCqz4HyEqGs/2.png",
    price : "48",
    amount : "2",
    name : "NFT Collection by Ljrr3045"
  },
  {
    id : "3",
    img : "https://ipfs.io/ipfs/QmUppT7rzGe5LhansP1qjyZnwyGUkhjAzNTmCqz4HyEqGs/3.png",
    price : "1500",
    amount : "45",
    name : "NFT Collection by Ljrr3045"
  },
  {
    id : "4",
    img : "https://ipfs.io/ipfs/QmUppT7rzGe5LhansP1qjyZnwyGUkhjAzNTmCqz4HyEqGs/4.png",
    price : "150",
    amount : "5",
    name : "NFT Collection by Ljrr3045"
  }
]

class App extends Component{

  constructor() {
    super();
    this.state = {
      data: data
    }
  }

  render(){
  return (
    <>
      <div className="row items mt-3">
      {this.state.data.map((item, idx) => {
        return (
        <div key={"exo_${idx}"} className="col-12 col-sm-6 col-lg-3 item">
          <div className="card">
            <div className="image-over">
            <img className="card-img-top" src={item.img} alt="" />
            </div>
           <div className="card-caption col-12 p-0"> 
             <div className="card-body">
              <h5 className="mb-0">{item.name}</h5>
              <div>
                <Button className="btn btn-bordered-white btn-smaller mt-3">
								  <i className="mr-2" />Buy Token
							  </Button>
              </div>
              <div>
                  <label style={{color:"green", display:"flex", justifyContent: "center"}}>Buy {item.amount} token, only for: {item.price}$</label>
              </div>
             </div>
           </div>
          </div>
        </div>
        )
      })}
      </div>
    </>
  );}
}

export default App;
