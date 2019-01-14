import { Component, OnInit } from '@angular/core';

import { Global } from '../shared/global';
import { BeerService } from '../services/beer.service';
import { StyleService } from '../services/style.service';
import { TapService } from '../services/tap.service';
import { SettingService } from '../services/setting.service';
import { ITap } from '../models/tap';
import { ISetting } from '../models/setting';
import { IStyle } from '../models/style';
import { IBeer } from '../models/beer';
import * as signalR from "@aspnet/signalr";
import { ILabel } from '../models/label';
import { LabelService } from '../services/label.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  loadingState: boolean;
  taps: ITap[];
  brewerySettings: object;
  background: string;
  connection = new signalR.HubConnectionBuilder()
    .withUrl("/hub")
    .build();

  constructor(
    private _beerService: BeerService,
    private _styleService: StyleService,
    private _tapService: TapService,
    private _settingService: SettingService,
    private _labelService: LabelService
    ) { }

  ngOnInit() {
    this.brewerySettings = {};
    this.loadingState = true;
    this.loadData();

    this.connection.start().catch(err => alert(err));
    this.connection.on("TapCreated", (tap) => {
      this.createTap(tap)
    });
    this.connection.on("TapDeleted", (id) => {
      this.deleteTap(id);
    });
    this.connection.on("TapUpdated", (tap) => {
      this.updateTap(tap);
    });
    this.connection.on("BeerUpdated", (id) => {
      this.updateBeer(id);
    });
    this.connection.on("LabelUpdated", (beerId, labelId) => {
      this.updateLabel(beerId, labelId);
    });
    this.connection.on("StyleUpdated", (id) => {
      this.updateStyle(id);
    });
    this.connection.on("SettingUpdated", (setting) => {
      this.updateSetting(setting);
    });
  }

  loadData(){
    this.loadingState = true;
    this._settingService.getAllSettings(Global.BASE_SETTING_ENDPOINT)
      .subscribe(settings =>{
        this._tapService.getAllTaps(Global.BASE_TAP_ENDPOINT)
          .subscribe(taps =>{
            var beerIds = taps.map(t => t.beerId);
            this._beerService.getBeersByIds(Global.BASE_BEER_ENDPOINT, beerIds)
              .subscribe(beers => {
                var styleIds = beers.map(b => b.styleId);
                var labelIds = beers.map(b => b.labelId);
                this._styleService.getStylesByIds(Global.BASE_STYLE_ENDPOINT, styleIds)
                  .subscribe(styles => {
                    this._labelService.getLabelsByIds(Global.BASE_LABEL_ENDPOINT, labelIds)
                      .subscribe(labels => {
                        this.setupMenu(settings, taps, styles, labels, beers);
                      });
                  });
              });
          });
      });
  }

  setupMenu(settings: ISetting[], taps: ITap[], styles: IStyle[], labels: ILabel[], beers: IBeer[]){
    this.loadingState = false;

    settings.forEach(setting => {
      this.brewerySettings[setting.key] = setting;
    });

    var backgroundByteArr = this.brewerySettings["MenuBackground"]["byteArrValue"];
    var backgroundSolidColor = this.brewerySettings["MenuSolidBackground"]["stringValue"];
    if (this.brewerySettings["MenuType"]["stringValue"] == "image" && backgroundByteArr != null){
      this.background = "url(data:image/jpg;base64,"+backgroundByteArr+")";
    }
    else{
      this.background = backgroundSolidColor != null ? backgroundSolidColor : "black";
    }

    beers.forEach((b)=>{
      b.style = styles.find((s)=>{return s.id == b.styleId;});
      b.label = labels.find((l)=>{return l.id == b.labelId;}); 
      if (b.label){
        b.labelSrc = `data:image/png;base64,${b.label.image}`;
      }
    });

    taps.forEach((t)=>{
      t.beer = beers.find((b) => {return b.id == t.beerId;});
    })

    this.taps = taps
      .sort((a, b) => {
        return a.order < b.order ? -1 : 1;
      });
  }

  //signalR-related functions
  async createTap(tap: ITap){
    tap = await this.fillTapData(tap);
    this.taps.push(tap);
    this.taps = this.taps
      .sort((a, b) => {
        return a.order < b.order ? -1 : 1;
      });
  }

  deleteTap(id:number){
    var deletedIndex = this.taps.map(t => t.id).indexOf(id);
    if (deletedIndex > -1){
      this.taps.splice(deletedIndex,1);
    }
  }

  async updateTap(tap:ITap){
    tap = await this.fillTapData(tap);
    var updatedIndex = this.taps.map(t => t.id).indexOf(tap.id);
    this.taps[updatedIndex] = tap;
  }

  async updateBeer(id:number){
    var updatedIndices = [];

    this.taps
      .map(t => t.beerId)
      .forEach((beerId, index) => {
        if (beerId == id){
          updatedIndices.push(index);
        }
      });

    if (updatedIndices.length){
      this._beerService.getBeerById(Global.BASE_BEER_ENDPOINT, id)
        .subscribe(async(beer) => {
          beer = await this.fillBeerData(beer);
          updatedIndices.forEach(i => {
            this.taps[i].beer = beer;
          }, this);
        });
    }
  }

  updateLabel(relatedBeerId:number, labelId:number){
    var updatedIndices = [];

    this.taps
      .map(t => t.beerId)
      .forEach((beerId, index) => {
        if (beerId == relatedBeerId){
          updatedIndices.push(index);
        }
      });
    
    if (updatedIndices.length){
      this._labelService.getLabelById(Global.BASE_LABEL_ENDPOINT, labelId)
        .subscribe(async(label) => {
          updatedIndices.forEach(i => {
            this.taps[i].beer.label = label;
            this.taps[i].beer.labelSrc = `data:image/png;base64,${label.image}`;
          }, this);
        });
    }
  }

  updateStyle(id:number){
    var updatedIndices = [];

    this.taps
      .map(t => t.beer)
      .map(b => b.styleId)
      .forEach((styleId, index) => {
        if (styleId == id){
          updatedIndices.push(index);
        }
      });

    if (updatedIndices.length){
      this._styleService.getStyleById(Global.BASE_STYLE_ENDPOINT, id)
        .subscribe(async(style) => {
          updatedIndices.forEach(i => {
            this.taps[i].beer.style = style;
          }, this);
        });
    }
  }

  updateSetting(setting:ISetting){
    this.brewerySettings[setting.key] = setting;
  }

  //helpers
  fillTapData(tap): Promise<ITap>{
    return new Promise(resolve => {
    this._beerService.getBeerById(Global.BASE_BEER_ENDPOINT, tap.beerId)
      .subscribe(async(beer) => {
        tap.beer = await this.fillBeerData(beer);
        resolve(tap);
      });
    });
  }

  fillBeerData(beer): Promise<IBeer>{
    return new Promise(resolve => {
      this._styleService.getStyleById(Global.BASE_STYLE_ENDPOINT, beer.styleId)
      .subscribe(style => {
        beer.style = style;
        if (beer.labelId){
          this._labelService.getLabelById(Global.BASE_LABEL_ENDPOINT, beer.labelId)
          .subscribe(label => {
            beer.label = label;
            beer.labelSrc = `data:image/png;base64,${beer.label.image}`;
            resolve(beer);
          });
        }
        else{
          resolve(beer);
        }
      });
    });
  }
}
