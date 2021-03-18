import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import Auth from '@aws-amplify/auth';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-confirm-code',
  templateUrl: './confirm-code.component.html',
  styleUrls: ['./confirm-code.component.scss']
})
export class ConfirmCodeComponent implements OnInit {

  phone = environment.confirm.phone;
  confirmForm: FormGroup = new FormGroup({
    phone: new FormControl({value: this.phone, disabled: true}),
    code: new FormControl('', [ Validators.required, Validators.min(3) ])
  });
  
  get codeInput() { return this.confirmForm.get('code'); }

  constructor( private _router: Router, private _notification: NotificationService ) { }

  ngOnInit() {
    if (!this.phone) {
      this._router.navigate(['auth/signup']);
    } else {
      Auth.resendSignUp(this.phone);
    }
  }

  sendAgain() {
    Auth.resendSignUp(this.phone)
      .then(() => this._notification.show('A code has been emailed to you'))
      .catch(() => this._notification.show('An error occurred'));
  }

  confirmCode() {
    Auth.confirmSignUp(this.phone, this.codeInput.value)
      .then((data: any) => {
        console.log(data);
        if (data === 'SUCCESS' &&
            environment.confirm.phone && 
            environment.confirm.password) {
          Auth.signIn(this.phone, environment.confirm.password)
            .then(() => {
              this._router.navigate(['']);
            }).catch((error: any) => {
              this._router.navigate(['auth/signin']);
            })
        }
      })
      .catch((error: any) => {
        console.log(error);
        this._notification.show(error.message);
      })
  }

}
