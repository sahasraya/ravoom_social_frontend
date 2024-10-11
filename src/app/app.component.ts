import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,CommonModule,HttpClientModule,FormsModule,ReactiveFormsModule,RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent   {
  title = 'Ravoom'; 

  // tasks:any=[];
  

  // get_tasks(){
  //   this.http.get(this.APIURL + "get_tasks").subscribe((res)=>{
  //     this.tasks = res;

  //   })
  // }

  // add_task(){
    // let body = new FormData();
    // body.append('task', this.newtask);
    // this.http.post(this.APIURL+"add_task",body).subscribe((res)=>{
    //   alert(res);
    //   this.newtask="";
    //   this.get_tasks();
    // })
  // }

  // delete_task(id:any){
  //   let body = new FormData();
  //   body.append('id',id);
  //   this.http.post(this.APIURL+ "delete_task",body).subscribe((res)=>{
  //     alert(res);
  //     this.get_tasks();
  //   })
  // }


}
