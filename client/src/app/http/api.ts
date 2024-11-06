import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { catchError, finalize, Observable, throwError } from "rxjs";


@Injectable({
    providedIn: 'root',
})

export class NetworkService{
    private activeRequests =0;
    private baseUrl =environment.API_URL

    constructor(private http:HttpClient) {}

    networkRequest(
        {url,method='GET',data={},headers={}}:{url:string,method?:string,data?:any,headers?:any}
    ):Observable<any>{
        this.activeRequests++;
        
       
        const options={
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Language': 'en',
                'Authorization': `Bearer ${localStorage.getItem('token')}` ,// Add your authentication token here
                ...headers,
            }),
            body:data,
        }

        const request$= this.http.request(method.toUpperCase(),`${this.baseUrl}${url}`, options)
        .pipe(
            catchError((error:HttpErrorResponse)=>this.handleError(error)),
            finalize(() => {
                this.activeRequests--
                if (this.activeRequests === 0) {
                    // this.store.dispatch(showLoader({loading:false}))
                }
            })
        )
        return request$;
    }


    private handleError(error:HttpErrorResponse){
        let errorMessage='An error occurred'
        if(error.error instanceof ErrorEvent){
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
        }else{
            // Server-side error
            if (error.status === 401 || error.status === 403) {
                // this.logout(); // Handle unauthorized access, log the user out
              }
              errorMessage = error.error?.message || errorMessage;
        }
        return throwError(() => new Error(errorMessage));
    }


    private logout() {
        localStorage.removeItem('auth_token');
        localStorage.clear();
        window.location.reload();
      }
}



