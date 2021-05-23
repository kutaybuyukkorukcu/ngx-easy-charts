import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChartModel, ChartQueryParams } from './chartModel';
import TimeInterval = ChartModel.TimeInterval;
import ChartType = ChartModel.ChartType;
import Chart = ChartModel.Chart;
import { ChartUtils } from './chartUtils';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpClient } from '@angular/common/http';
import { ApiCallService } from './apiCall.service';
import ChartRequest = ChartModel.ChartRequest;

@Component({
  selector: 'lib-ng2-charts-wrapper',
  template: `
    <div class="min-w-screen min-h-screen bg-gray-900 flex items-center justify-center px-5 py-5">
      <div class="bg-gray-800 text-gray-500 rounded shadow-xl py-5 px-5 w-full lg:w-1/2">
          <div class="flex flex-wrap items-end">
              <div class="flex-1">
                  <h3 class="text-lg font-semibold leading-tight">{{ title }}</h3>
              </div>
              <div class="relative">
                  <button class="text-xs hover:text-gray-300 h-6 focus:outline-none">
                      <span x-text="chartData.options[chartData.selectedOption].label"></span><i class="ml-1 mdi mdi-chevron-down"></i>
                  </button>
                  <div class="bg-gray-700 shadow-lg rounded text-sm absolute top-auto right-0 min-w-full w-32 z-30 mt-1 -mr-3" style="display: none;">
                      <span class="absolute top-0 right-0 w-3 h-3 bg-gray-700 transform rotate-45 -mt-1 mr-3"></span>
                      <div class="bg-gray-700 rounded w-full relative z-10 py-1">
                          <ul class="list-reset text-xs">
                            <li *ngFor="let timeInterval of TimeInterval; index as i;">
                              {{ timeInterval }}
                            </li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>
          <div class="chart-wrapper">
            <single-dataset-chart *ngIf="isSingleDataSetChartSelected == true" [chart]="chart">
            </single-dataset-chart>
            <multi-dataset-chart *ngIf="isMultiDataSetChartSelected == true" [chart]="chart">
            </multi-dataset-chart>      
            <ngx-spinner
              bdColor="rgba(51,51,51,0.8)"
              size="medium"
              color="#fff"
              type="ball-scale-multiple"
            >
              <p style="font-size: 20px; color: white">Loading...</p>
            </ngx-spinner>
          </div>
      </div>
    </div>
  `,
  styles: [
    './styles.scss'
  ]
})
export class Ng2ChartsWrapperComponent implements OnInit, OnDestroy {

  subscription: Subscription = new Subscription();
  chartUtils = new ChartUtils();
  chartQueryParams!: ChartQueryParams;
  currentChartType!: ChartType;
  chart: Chart = new Chart();
  @Input() title!: string;

  isSingleDataSetChartSelected!: boolean;
  isMultiDataSetChartSelected!: boolean;

  constructor(private spinner: NgxSpinnerService, private httpClient: HttpClient, private apiService: ApiCallService) {}

  ngOnInit(): void {

    this.spinner.show();
    
    // If chartData is not undefined that means singledataset chart is current. and vice versa.
    this.isSingleDataSetChartSelected = this.chart.chartData != undefined ? true : false;
    this.isMultiDataSetChartSelected = !this.isSingleDataSetChartSelected;

    this.getChartDataSet(ChartRequest.SINGLEDATASET);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public onChangeTimeInterval(timeInterval: TimeInterval) {
    this.chartQueryParams.timeInterval = timeInterval;
    // mock request
  }

  public onChangeChartType(chartType: ChartType) {
    this.currentChartType = chartType;
    this.chart.currentChartType = this.currentChartType;
    this.chart.currentChartTypeOptions = this.chartUtils.getCurrentChartTypeOptions(this.currentChartType);
  }

  public getChartDataSet(dataset: string) {
    this.apiService
    .getChartDataSet(dataset)
    .subscribe((data: any) => {

      if (this.isSingleDataSetChartSelected == true) {
        this.chart.chartData = data;
        this.isMultiDataSetChartSelected = false;
      } else if (this.isMultiDataSetChartSelected == true) {
        this.chart.chartDataSet = data;
        this.isSingleDataSetChartSelected = false;
      }
    });
  }
}