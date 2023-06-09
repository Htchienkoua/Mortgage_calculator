import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApplicationDialogComponent } from '../application-dialog/application-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Constants } from '../interfaces/constants';
import { ApiService } from '../services/api.service';

const fb = new FormBuilder().nonNullable;

interface ChartData {
  value: number;
  label: string;
}

@Component({
  selector: 'app-monthly-calc',
  templateUrl: './monthly-calc.component.html',
  styleUrls: ['./monthly-calc.component.scss'],
})
export class MonthlyCalcComponent implements OnInit {
  childrenOptions: number[] = [];
  applicantsOptions: number[] = [];
  maxMonthlyObligationsPercentage: number;
  constants: Constants;
  fields = [
    {
      label: 'Mortgage Loans',
      controlName: 'mortgageLoans',
    },
    {
      label: 'Consumer Loans',
      controlName: 'consumerLoans',
    },
    {
      label: 'Leasing Amount',
      controlName: 'leasingAmount',
    },
    {
      label: 'Credit Card Limit',
      controlName: 'creditCardLimit',
    },
  ];
  chartFields = [
    { label: 'Mortgage loans', controlName: 'mortgageLoans' },
    { label: 'Consumer loans', controlName: 'consumerLoans' },
    { label: 'Leasing amount', controlName: 'leasingAmount' },
    { label: 'Credit card limit', controlName: 'creditCardLimit' },
    { label: 'Monthly max payment', controlName: 'monthlyPaymentDisplay' },
  ];
  chartLabels: string[] = this.chartFields.map((field) => field.label);
  monthlyPaymentResult: number = 0;
  calculateBtnPushed: boolean = false;
  formSubmitted = false;
  isDisabled: boolean = true;
  chartData: number[] = [];
  mortgageMonthly: number;
  totalDisplay: string = '';
  monthlyCalcData: any;

  monthlyForm = fb.group(
    {
      applicants: [1 as number, Validators.required],
      amountOfKids: ['', Validators.required],
      income: ['', [Validators.required, Validators.pattern('[0-9]*')]],
      monthlyPaymentDisplay: [{ value: '', disabled: this.isDisabled }],
      obligation: [false as boolean, Validators.required],
      mortgageLoans: ['', Validators.pattern('[0-9]*')],
      consumerLoans: ['', Validators.pattern('[0-9]*')],
      leasingAmount: ['', Validators.pattern('[0-9]*')],
      creditCardLimit: ['', Validators.pattern('[0-9]*')],
    },
    { updateOn: 'change' }
  );

  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private apiService: ApiService
  ) {}

  saveData() {
    const monthlyCalcData = this.monthlyForm.value;
    localStorage.setItem('monthlyCalcData', JSON.stringify(monthlyCalcData));
    console.log(monthlyCalcData);
  }

  loadData() {
    const monthlyCalcData = JSON.parse(localStorage.getItem('monthlyCalcData'));
  }

  clearData() {
    localStorage.removeItem('monthlyCalcData');
  }

  ngOnInit() {
    this.loadData();
    this.monthlyForm.valueChanges.subscribe(() => {
      this.saveData();
    });
    if (this.monthlyForm && localStorage.getItem('monthlyCalcData')) {
      const monthlyCalcData = JSON.parse(
        localStorage.getItem('monthlyCalcData')
      );
      this.monthlyForm.patchValue(monthlyCalcData);
    }

    const storedData = localStorage.getItem('monthlyCalcData');
    if (storedData) {
      this.monthlyCalcData = JSON.parse(storedData);
    } else {
      this.monthlyCalcData = { obligation: false };
    }

    this.monthlyForm.get('obligation').valueChanges.subscribe((value) => {
      if (!value) {
        this.monthlyForm.get('mortgageLoans').reset();
        this.monthlyForm.get('consumerLoans').reset();
        this.monthlyForm.get('leasingAmount').reset();
        this.monthlyForm.get('creditCardLimit').reset();
        this.monthlyForm.get('monthlyPaymentDisplay').reset();
      }
    });
    this.apiService.getConstants().subscribe((constants) => {
      this.constants = constants;
      this.maxMonthlyObligationsPercentage =
        constants.maxMonthlyObligationsPercentage;
      const minKids = constants.minKids;
      const maxKids = constants.maxKids;
      const maxNumOfApplicants = constants.maxNumOfApplicants;
      for (let i = minKids; i <= maxKids; i++) {
        this.childrenOptions.push(i);
      }
      for (let i = 1; i <= maxNumOfApplicants; i++) {
        this.applicantsOptions.push(i);
      }
    });
  }

  transformToValid() {
    const regex: RegExp = /^[0-9]*(\,|\.){1}[0-9]{1,2}/;
    const checkForComma: RegExp = /^[0-9]*\,{1}[0-9]{1,2}/;

    if (regex.test(this.income.value)) {
      this.income.setValue(this.income.value.match(regex)[0]);
    }

    if (checkForComma.test(this.income.value)) {
      const commaIndex = this.income.value.indexOf(',');
      this.income.setValue(
        this.income.value.substring(0, commaIndex) +
          '.' +
          this.income.value.substring(commaIndex + 1)
      );
    }
  }

  onSubmit() {
    if (this.monthlyForm.valid) {
      // submit form data
    } else {
      this.monthlyForm.markAllAsTouched(); // mark all fields as touched to trigger validation messages
    }
  }

  get applicants() {
    return this.monthlyForm.get('applicants');
  }

  get amountOfKids() {
    return this.monthlyForm.get('amountOfKids');
  }

  get income() {
    return this.monthlyForm.get('income');
  }

  get monthlyPaymentDisplay() {
    return this.monthlyForm.get('monthlyPaymentDisplay');
  }

  get obligation() {
    return this.monthlyForm.get('obligation');
  }

  get mortgageLoans() {
    return this.monthlyForm.get('mortgageLoans');
  }

  get consumerLoans() {
    return this.monthlyForm.get('consumerLoans');
  }

  get leasingAmount() {
    return this.monthlyForm.get('leasingAmount');
  }

  get creditCardLimit() {
    return this.monthlyForm.get('creditCardLimit');
  }

  monthlyPayment() {
    if (this.monthlyForm.valid) {
      this.formSubmitted = true;
      const maxMonthlyObligationsPercentage =
        this.maxMonthlyObligationsPercentage;
      const income = Number(this.monthlyForm.get('income').value);
      const creditCardLimit = Number(
        this.monthlyForm.get('creditCardLimit').value || 0
      );
      const leasingAmount = Number(
        this.monthlyForm.get('leasingAmount').value || 0
      );
      const consumerLoans = Number(
        this.monthlyForm.get('consumerLoans').value || 0
      );
      const mortgageLoans = Number(
        this.monthlyForm.get('mortgageLoans').value || 0
      );

      const mortgageMonthly =
        (mortgageLoans * (0.055 / 12)) / (1 - Math.pow(1 + 0.055 / 12, -300));
      const leasingMonthly =
        (leasingAmount * (0.07 / 12)) / (1 - Math.pow(1 + 0.07 / 12, -60));
      const consumerMonthly =
        (consumerLoans * (0.1 / 12)) / (1 - Math.pow(1 + 0.1 / 12, -60));
      const creditCardMonthly = creditCardLimit / 36;

      const totalObligations = this.monthlyForm.get('obligation').value
        ? creditCardMonthly + consumerMonthly + mortgageMonthly + leasingMonthly
        : 0;
      this.monthlyPaymentResult = Math.round(
        totalObligations > 0
          ? income * maxMonthlyObligationsPercentage - totalObligations
          : income * maxMonthlyObligationsPercentage
      );

      this.chartData = [
        Math.round(Number(mortgageMonthly)),
        Math.round(Number(consumerMonthly)),
        Math.round(Number(leasingMonthly)),
        Math.round(Number(creditCardMonthly)),
        Math.round(this.monthlyPaymentResult),
      ];

      this.totalDisplay = Math.round(this.monthlyPaymentResult).toString();

      this.calculateBtnPushed = true;
    }
  }

  onInputChanged() {
    if (this.calculateBtnPushed) {
      this.monthlyPayment();
    }
  }

  get showInsufficientMessage() {
    return (
      this.formSubmitted &&
      this.monthlyPaymentResult <= 0 &&
      this.monthlyForm.get('income').value
    );
  }

  openDialog(): void {
    this.dialog.open(ApplicationDialogComponent, {
      data: {
        applicants: this.applicants.value,
        amountOfKids: this.amountOfKids.value,
        obligations: this.obligation.value,
        monthlyIncome: this.income.value,
        mortgageLoans: +this.mortgageLoans.value,
        consumerLoans: +this.consumerLoans.value,
        leasingAmount: +this.leasingAmount.value,
        creditCardLimit: +this.creditCardLimit.value,
      },
      minWidth: '400px',
    });
  }

  clickMe(event: Event) {
    this._snackBar.open(
      'Please provide outstanding loan amounts. Your monthly payment is being calculated taking in account such parameters - \
    Mortgage loan 25years/5.5%/annuity;  \
    Consumer loan 5years/10%/annuity;  \
    Leasing amount 5years/7%/annuity;  \
    Credit card limit 3years. \
    ',
      null,
      {
        duration: 15000,
      }
    );
    event.stopPropagation();
  }

  unclickMe(event: Event) {
    this._snackBar.dismiss();
    event.stopPropagation();
  }
}
