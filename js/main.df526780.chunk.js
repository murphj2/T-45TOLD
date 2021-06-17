var FullWet, FullDry, HalfWet, HalfDry, AbortDR, AbortRL, MasterURL;
var expLimit = 62;
var NQItimePulled, NMMtimePulled, NJKtimePulled, qTimePulled = 0;
var q_DR = 0;
var refreshing = !1;
var time = 0;

/**
 * Initializes all global variables. <br>
 * Calls update3MainFields to fetch and populate KNQI, KNMM, and KNJK. <br>
 * Calls dataEnterMethod to ensure manual entry method matches data entry method
 * selection button.
 */
function initializeAll() {
  FullWet = [
    [1.3, 2, 2.7, 3.3, 3.8, 4.35, 4.85, 5.35, 5.8],
    [1.275, 1.95, 2.6, 3.2, 3.7, 4.15, 4.65, 5.1, 5.55],
    [1.25, 1.9, 2.55, 3.05, 3.55, 4, 4.45, 4.8, 5.3],
    [1.2, 1.85, 2.45, 2.95, 3.4, 3.85, 4.25, 4.65, 5.05],
    [1.175, 1.8, 2.35, 2.85, 3.3, 3.7, 4.05, 4.45, 4.8],
    [1.15, 1.7, 2.25, 2.75, 3.15, 3.5, 3.9, 4.2, 4.55],
    [1.125, 1.65, 2.15, 2.6, 3, 3.35, 3.7, 4, 4.3],
    [1.1, 1.6, 2.05, 2.45, 2.85, 3.2, 3.5, 3.8, 4.05]
  ];
  FullDry = [
    [2.15, 3.2, 3.95, 4.6, 5.25, 5.8, 6.25, 6.7, 7.1],
    [2.1, 3.1, 3.85, 4.5, 5.05, 5.55, 6.05, 6.45, 6.85],
    [2, 2.95, 3.7, 4.3, 4.85, 5.35, 5.8, 6.2, 6.6],
    [1.95, 2.85, 3.55, 4.15, 4.65, 5.1, 5.55, 5.95, 6.35],
    [1.85, 2.75, 3.4, 3.95, 4.45, 4.9, 5.3, 5.65, 6.05],
    [1.75, 2.6, 3.25, 3.8, 4.25, 4.65, 5.05, 5.4, 5.75],
    [1.7, 2.45, 3.1, 3.6, 4.05, 4.45, 4.8, 5.1, 5.45],
    [1.6, 2.3, 2.95, 3.45, 3.85, 4.2, 4.55, 4.85, 5.15]
  ];
  HalfWet = [
    [1.25, 2.05, 2.6, 3.2, 3.65, 4.15, 4.65, 5.05, 5.45],
    [1.25, 2, 2.55, 3.1, 3.55, 4, 4.45, 4.85, 5.25],
    [1.25, 1.95, 2.5, 3.025, 3.45, 3.875, 4.3, 4.7, 5.05],
    [1.225, 1.9, 2.425, 2.9, 3.35, 3.725, 4.1, 4.5, 4.85],
    [1.2, 1.825, 2.35, 2.8, 3.2, 3.55, 3.9, 4.3, 4.6],
    [1.15, 1.75, 2.25, 2.7, 3.05, 3.4, 3.75, 4.1, 4.4],
    [1.1, 1.65, 2.15, 2.6, 2.9, 3.25, 3.55, 3.9, 4.15],
    [1.05, 1.6, 2.1, 2.5, 2.8, 3.1, 3.4, 3.7, 2.95]
  ];
  HalfDry = [
    [1.2, 2.2, 3, 3.75, 4.3, 4.9, 5.4, 5.85, 6.3],
    [1.15, 2.1, 2.9, 3.55, 4.15, 4.7, 5.2, 5.65, 6.05],
    [1.1, 2, 2.75, 3.4, 3.95, 4.5, 4.95, 5.4, 5.8],
    [1.05, 1.9, 2.6, 3.25, 3.8, 4.3, 4.7, 5.15, 5.5],
    [0.95, 1.8, 2.5, 3.05, 3.6, 4.05, 4.5, 4.85, 5.2],
    [0.85, 1.65, 2.35, 2.9, 3.4, 3.85, 4.25, 4.6, 4.95],
    [0.75, 1.55, 2.15, 2.7, 3.15, 3.6, 3.95, 4.3, 4.6],
    [0.65, 1.4, 2, 2.45, 2.9, 3.3, 3.65, 4, 4.3]
  ];
  AbortDR = [1.05, 1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7];
  AbortRL = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  MasterURL = "https://avwx.rest/api/metar/";

  update3MainFields();
  dataEnterMethod();
}
/**
 * Called when a key is pressed while typing in 'stationID' input tag
 * Calls updateStationID if keypressed is 'Enter' to fetch METAR and populate data
 * 
 * @returns {undefined}
 */
function search() {
  if (event.keyCode === 13) {
    updateStationID();
  }
}
/**
 * Takes in and adds 0's in front until length is equal to e
 * Primary used for Hours and Minutes for displaying refresh time.
 * @param {String} t String to pad
 * @param {Number} e Requested final length
 * @returns {String} Padded string of length e
 */
function pad(t, e) {
  for (t = t.toString(); t.length < e; )
    t = "0" + t;
  return t;
}
/**
 * Rounds num to 'places' decimal places: 1.273,1 --> 1.3
 * @param {Number} num
 * @param {Number} places 1->0.x, 2->0.xx, etc
 * @returns {Number}
 */
function roundToxPlaces(num, places) {
  return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
}
/**
 * Summary. Calculates idle RPM due to Pressure Altitude and Temperature
 * Description. Calculation follows general guideline of +1% for every 1500' increase in 
 * Pressure Altitude and +1% for every 10°C above standard temperature (15°C)
 * Temperature can be °F or °C and it will convert to °C if tempIsC is false
 * @param {Number}   PA      Pressure Altitude (ft)
 * @param {Number}   temp    Temperature (°C or °F)
 * @param {Boolean}  tempIsC True if temp is °C, if not temp will be converted
 * @returns {Number} rpm     Idle RPM due to Pressure Altitude and Temperature
 */
function getRPM(PA, temp, tempIsC) {
  if (!tempIsC) {
    temp = tempConv(temp, false);
  }
  var rpm = 56.5 + (PA / 1500) + ((temp - 15) / 10);
  rpm = roundToxPlaces(rpm, 1);
  return rpm;
}
/**
 * Summary:     Determines density ratio.
 * <br><br>
 * Description: Determines density of air at station using station pressure, relative 
 * humidity and temperature at station. Temperature entered can be either °F or
 * °C and is converted to Kelvin for gas equation. Density ratio is compared to 
 * standard day sea level pressure (1.225 kg/m^3).<br><br>               
 * Calculations based on "https://www.omnicalculator.com/physics/air-density"
 * @param {Number} temp            (°C or °F) Temperature 
 * @param {type}   RH              (0-1.0)    Relative Humidity  
 * @param {type}   stationPressure (inHg)     Atmospheric pressure at the 
 * station. Calculated from altimeter setting using precision lapse equation.
 * 
 * @param {type}  tempIsC          True if temp is °C, if not temp will be converted
 * @returns {Number} Density ratio 
 */
function getDensityRatio(temp, RH, stationPressure, tempIsC) {
  var dr;
  if (!tempIsC) {
    temp = tempConv(temp, false);
  }
  temp = temp + 273.15;
  var p1 = 6.1078 * 10 ^ (7.5 * (temp) / ((temp) + 237.3));
  var pv = p1 * RH;
  var pd = (stationPressure * 3386.388666666) - pv;
  var curDens = (pd / (287.058 * (temp))) + (pv / (461.495 * (temp)));
  dr = curDens / 1.225;
  return dr;

}
/**
 * Calculates minutes between current time and timestamp.
 * @param {Date}     timeStamp 
 * @returns {Number} minutes between current time and timestamp
 */
function minutesBetween(timeStamp) {
  var obs = new Date(timeStamp);
  var today = new Date();
  var diff = (today - obs) / 60000;
  return Math.round(diff);
}
/**
 * Converts Pa to inHg
 * @param {Number} Pa Pascals
 * @returns {Number} inHg
 */
function getBaro(Pa) {
  return Pa * 0.00029530;
}
/**
 * @deprecated Was trying gov server but METARs didn't populate as quickly. 
 * Tried to get AWC Text Data Server but cors error. May be beneficial in future
 *  if AVWX becomes no longer supported. 
 * @param {type} stID
 * @returns {String}
 */
function getURL(stID) {
  return "https://api.weather.gov/stations/" + stID + "/observations/latest?require_qc=true";
}
/**
 * Calculates line speed at 1500' for given Density Ratio
 * <br><br>
 * Calculations from PCL(IC-19) Figure 14/ NATOPS(IC-41) Figure 26-9
 * @param {Number}   DR Density Ratio
 * @returns {Number} LS Line Speed (knots)
 */
function getNormalLineSpeedHalf(DR) {
  var LS = 60.47936 * Math.exp(0.6016 * DR);
  LS = roundToxPlaces(LS, 1);
  return LS;
}
/**
 * Calculates line speed at 1500' for given Density Ratio
 * <br><br>
 * Calculations from PCL(IC-19) Figure 15/ NATOPS(IC-41) Figure 26-11
 * @param {Number}   DR Density Ratio
 * @returns {Number} LS Line Speed (knots)
 */
function getNormalLineSpeedFull(DR) {
  var LS = 106.941256 * (Math.pow(DR, 0.995592));
  LS = roundToxPlaces(LS, 1);
  return LS;
}
/**
 * Calculates line speed at 1500' for given Density Ratio
 * <br><br>
 * Calculations from PCL(IC-19) Figure 16/ NATOPS(IC-41) Figure 26-13
 * @param {Number}   DR Density Ratio
 * @returns {Number} LS Line Speed (knots)
 */
function getSectionLineSpeed(DR) {
  var LS = 31.798985 * Math.exp(1.192471 * DR);
  LS = roundToxPlaces(LS, 1);
  return LS;
}
/**
 * Calculates takeoff distance for given Density Ratio
 * <br><br>
 * Calculations from PCL(IC-19) Figure 11/ NATOPS(IC-41) Figure 26-3
 * @param {Number}   DR Density Ratio
 * @returns {Number} LS Line Speed (knots)
 */
function getNormalTOHalf(DR) {
  var TOD = 27962.2164378757 * Math.exp(-2.510794011937820 * DR);
  TOD = Math.round(TOD);
  return TOD;
}
/**
 * Calculates takeoff distance for given Density Ratio
 * <br><br>
 * Calculations from PCL(IC-19) Figure 12/ NATOPS(IC-41) Figure 26-5
 * @param {Number}   DR Density Ratio
 * @returns {Number} LS Line Speed (knots)
 */
function getNormalTOFull(DR) {
  var TOD = 20770.0443790002 * Math.exp(-2.4730121317097 * DR);
  TOD = Math.round(TOD);
  return TOD;
}
/**
 * Calculates takeoff distance for given Density Ratio
 * <br><br>
 * Calculations from PCL(IC-19) Figure 13/ NATOPS(IC-41) Figure 26-7
 * @param {Number}   DR Density Ratio
 * @returns {Number} LS Line Speed (knots)
 */
function getSectionTO(DR) {
  var TOD = 26108.1555973667 * Math.exp(-2.3670135208 * DR);
  TOD = Math.round(TOD);
  return TOD;
}
/**
 * Calculates abortspeed for given Density Ratio and runway length
 * <br><br>
 * Calculations from PCL(IC-19) Figure 17/ NATOPS(IC-41) Figure 26-14
 * @param {Number}   DR Density Ratio
 * @param {Number}   RL Runway Length (2-10)(1000's ft) 
 * @returns {Number} LS Line Speed (knots)
 */
function getAbortDryHalf(DR, RL) {
  var DRind;
  var RLind;
  var Q11;
  var Q12;
  var Q21;
  var Q22;
  var slope;
  var Z;
  DR < .7 ? DR = 7 :
          DR > 1.05 ? DR = 1.05 :
          undefined;
  RL < 2 ? RL = 2 :
          RL > 10 ? RL = 10 :
          undefined;
  DRind = AbortDR.findIndex((element) => element <= DR);
  RLind = AbortRL.findIndex((element) => element >= RL);
  var DR1 = AbortDR[DRind];
  var DR2 = AbortDR[DRind === 0 ? DRind : DRind - 1];
  var RL1 = AbortRL[RLind];
  var RL2 = AbortRL[RLind === 0 ? RLind : RLind - 1];
  Q11 = HalfDry[DRind][RLind];
  Q12 = HalfDry[DRind][RLind === 0 ? RLind : RLind - 1];
  Q21 = HalfDry[DRind === 0 ? DRind : DRind - 1][RLind];
  Q22 = HalfDry[DRind === 0 ? DRind : DRind - 1][RLind === 0 ? RLind : RLind - 1];
  if (DRind === 0 && RLind !== 0) {
    slope = (Q12 - Q11) / (RL2 - RL1);
    Z = slope * (RL - RL1) + Q11;
  } else if (RLind === 0 && DRind !== 0) {
    slope = (Q21 - Q11) / (DR2 - DR1);
    Z = slope * (DR - DR1) + Q11;
  } else if (RLind === 0 && DRind === 0) {
    Z = Q11;
  } else {
    slope = 1 / ((DR2 - DR1) * (RL2 - RL1));
    Z = slope * (Q11 * (DR2 - DR) * (RL2 - RL) + Q21 * (DR - DR1) * (RL2 - RL) + Q12 * (DR2 - DR) * (RL - RL1) + Q22 * (DR - DR1) * (RL - RL1));
  }
  var abortspeed = 20 * Z + 40;
  abortspeed = roundToxPlaces(abortspeed, 1);
  return abortspeed;
}
/**
 * Calculates abortspeed for given Density Ratio and runway length
 * <br><br>
 * Calculations from PCL(IC-19) Figure 18/ NATOPS(IC-41) Figure 26-15
 * @param {Number}   DR Density Ratio
 * @param {Number}   RL Runway Length (2-10)(1000's ft) 
 * @returns {Number} LS Line Speed (knots)
 */
function getAbortDryFull(DR, RL) {
  var DRind;
  var RLind;
  var Q11;
  var Q12;
  var Q21;
  var Q22;
  var slope;
  var Z;
  DR < .7 ? DR = 7 :
          DR > 1.05 ? DR = 1.05 :
          undefined;
  RL < 2 ? RL = 2 :
          RL > 10 ? RL = 10 :
          undefined;
  DRind = AbortDR.findIndex((element) => element <= DR);
  RLind = AbortRL.findIndex((element) => element >= RL);
  var DR1 = AbortDR[DRind];
  var DR2 = AbortDR[DRind === 0 ? DRind : DRind - 1];
  var RL1 = AbortRL[RLind];
  var RL2 = AbortRL[RLind === 0 ? RLind : RLind - 1];
  Q11 = FullDry[DRind][RLind];
  Q12 = FullDry[DRind][RLind === 0 ? RLind : RLind - 1];
  Q21 = FullDry[DRind === 0 ? DRind : DRind - 1][RLind];
  Q22 = FullDry[DRind === 0 ? DRind : DRind - 1][RLind === 0 ? RLind : RLind - 1];
  if (DRind === 0 && RLind !== 0) {
    slope = (Q12 - Q11) / (RL2 - RL1);
    Z = slope * (RL - RL1) + Q11;
  } else if (RLind === 0 && DRind !== 0) {
    slope = (Q21 - Q11) / (DR2 - DR1);
    Z = slope * (DR - DR1) + Q11;
  } else if (RLind === 0 && DRind === 0) {
    Z = Q11;
  } else {
    slope = 1 / ((DR2 - DR1) * (RL2 - RL1));
    Z = slope * (Q11 * (DR2 - DR) * (RL2 - RL) + Q21 * (DR - DR1) * (RL2 - RL) + Q12 * (DR2 - DR) * (RL - RL1) + Q22 * (DR - DR1) * (RL - RL1));
  }
  var abortspeed = 20.5 * Z + 17;
  abortspeed = roundToxPlaces(abortspeed, 1);
  return abortspeed;
}
/**
 * Calculates abortspeed for given Density Ratio and runway length
 * <br><br>
 * Calculations from PCL(IC-19) Figure 19/ NATOPS(IC-41) Figure 26-16
 * @param {Number}   DR Density Ratio
 * @param {Number}   RL Runway Length (2-10)(1000's ft) 
 * @returns {Number} LS Line Speed (knots)
 */
function getAbortWetHalf(DR, RL) {
  var DRind;
  var RLind;
  var Q11;
  var Q12;
  var Q21;
  var Q22;
  var slope;
  var Z;
  DR < .7 ? DR = 7 :
          DR > 1.05 ? DR = 1.05 :
          undefined;
  RL < 2 ? RL = 2 :
          RL > 10 ? RL = 10 :
          undefined;
  DRind = AbortDR.findIndex((element) => element <= DR);
  RLind = AbortRL.findIndex((element) => element >= RL);
  var DR1 = AbortDR[DRind];
  var DR2 = AbortDR[DRind === 0 ? DRind : DRind - 1];
  var RL1 = AbortRL[RLind];
  var RL2 = AbortRL[RLind === 0 ? RLind : RLind - 1];
  Q11 = HalfWet[DRind][RLind];
  Q12 = HalfWet[DRind][RLind === 0 ? RLind : RLind - 1];
  Q21 = HalfWet[DRind === 0 ? DRind : DRind - 1][RLind];
  Q22 = HalfWet[DRind === 0 ? DRind : DRind - 1][RLind === 0 ? RLind : RLind - 1];
  if (DRind === 0 && RLind !== 0) {
    slope = (Q12 - Q11) / (RL2 - RL1);
    Z = slope * (RL - RL1) + Q11;
  } else if (RLind === 0 && DRind !== 0) {
    slope = (Q21 - Q11) / (DR2 - DR1);
    Z = slope * (DR - DR1) + Q11;
  } else if (RLind === 0 && DRind === 0) {
    Z = Q11;
  } else {
    slope = 1 / ((DR2 - DR1) * (RL2 - RL1));
    Z = slope * (Q11 * (DR2 - DR) * (RL2 - RL) + Q21 * (DR - DR1) * (RL2 - RL) + Q12 * (DR2 - DR) * (RL - RL1) + Q22 * (DR - DR1) * (RL - RL1));
  }
  var abortspeed = 20.5 * Z + 17;
  abortspeed = roundToxPlaces(abortspeed, 1);
  return abortspeed;
}
/**
 * Calculates abortspeed for given Density Ratio and runway length
 * <br><br>
 * Calculations from PCL(IC-19) Figure 20/ NATOPS(IC-41) Figure 26-17
 * @param {Number}   DR Density Ratio
 * @param {Number}   RL Runway Length (2-10)(1000's ft) 
 * @returns {Number} LS Line Speed (knots)
 */
function getAbortWetFull(DR, RL) {
  var DRind;
  var RLind;
  var Q11;
  var Q12;
  var Q21;
  var Q22;
  var slope;
  var Z;
  DR < .7 ? DR = 7 :
          DR > 1.05 ? DR = 1.05 :
          undefined;
  RL < 2 ? RL = 2 :
          RL > 10 ? RL = 10 :
          undefined;
  DRind = AbortDR.findIndex((element) => element <= DR);
  RLind = AbortRL.findIndex((element) => element >= RL);
  var DR1 = AbortDR[DRind];
  var DR2 = AbortDR[DRind === 0 ? DRind : DRind - 1];
  var RL1 = AbortRL[RLind];
  var RL2 = AbortRL[RLind === 0 ? RLind : RLind - 1];
  Q11 = FullWet[DRind][RLind];
  Q12 = FullWet[DRind][RLind === 0 ? RLind : RLind - 1];
  Q21 = FullWet[DRind === 0 ? DRind : DRind - 1][RLind];
  Q22 = FullWet[DRind === 0 ? DRind : DRind - 1][RLind === 0 ? RLind : RLind - 1];
  if (DRind === 0 && RLind !== 0) {
    slope = (Q12 - Q11) / (RL2 - RL1);
    Z = slope * (RL - RL1) + Q11;
  } else if (RLind === 0 && DRind !== 0) {
    slope = (Q21 - Q11) / (DR2 - DR1);
    Z = slope * (DR - DR1) + Q11;
  } else if (RLind === 0 && DRind === 0) {
    Z = Q11;
  } else {
    slope = 1 / ((DR2 - DR1) * (RL2 - RL1));
    Z = slope * (Q11 * (DR2 - DR) * (RL2 - RL) + Q21 * (DR - DR1) * (RL2 - RL) + Q12 * (DR2 - DR) * (RL - RL1) + Q22 * (DR - DR1) * (RL - RL1));
  }
  var abortspeed = 20.75 * Z + 15.5;
  abortspeed = roundToxPlaces(abortspeed, 1);
  return abortspeed;
}
/**
 * Calculates minimum RPM at RPM for runup
 * <br><br>
 * Calculations from PCL(IC-19) Figure 20/ NATOPS(IC-41) Figure 26-17
 * @param {Number}   temp    Temperature (°C or °F)
 * @param {Boolean}  tempIsC True if temp is °C, if not temp will be converted
 * @returns {Number} minRPMatMRT
 */
function getMinRPMatMRT(temp, tempIsC) {
  if (tempIsC) {
    temp = tempConv(temp, true);
  }
  return temp > 51 ? 97
          : temp >= 37 ? 96
          : temp >= 21 ? 95
          : temp >= 9 ? 94
          : temp >= -5 ? 93
          : 92;
}
/**
 * Hides and shows appropriate html tag associated with manual input method 
 * selected through 'entryMethod' checkbox.
 * @returns {undefined}
 */
function dataEnterMethod() {
  var manualData = document.getElementById("entryMethod").checked;//Boolean
  if (manualData) {
    document.getElementById("airportData").style.display = 'none';
    document.getElementById("manualData").style.display = 'block';
  } else {
    document.getElementById("airportData").style.display = 'block';
    document.getElementById("manualData").style.display = 'none';
  }
}
/**
 * Converts between °C and °F
 * @param {Number} temp
 * @param {Boolean} cTOf °C->°F: true; °F->°C:false
 * @returns {Number}
 */
function tempConv(temp, cTOf) {
  if (cTOf) {
    return (temp * (9 / 5)) + 32;
  } else {
    return (temp - 32) * (5 / 9);
  }
}
/**
 * Calculates acutal pressure at station from altimeter setting and field elevation.
 * <br><br>
 * Calculation based on "https://www.weather.gov/media/epz/wxcalc/stationPressure.pdf"
 * @param {Number} altimeter inHg
 * @param {Number} fieldElev feet
 * @returns {Number} station pressure (inHg)
 */
function getStationPressure(altimeter, fieldElev) {
  return altimeter * Math.pow((288 - (0.0065 * 0.3048 * fieldElev)) / 288, 5.2561);
}
/**
 * Return backcalculated field elevation from reported altimeter and pressure 
 * altitude.
 * @param {Number}   altimeter inHg
 * @param {Number}   PA        feet
 * @returns {Number} fieldElev feet
 */
function getFieldElev(altimeter, PA) {
  return PA - (1000 * (29.92 - altimeter));
}
/**
 * Fetches and populates KNQI, KNMM, KNJK METAR and TOLD data.
 * Async function allows "Loading" header to be displayed until all fetches have 
 * completed
 * 
 * @returns {undefined}
 */
async function update3MainFields() {
  var today = new Date();
  time = pad(today.getUTCHours(), 2) + "" + pad(today.getUTCMinutes(), 2) + " Z";
  document.getElementById("refreshtime").innerHTML = time;

  await fetch(MasterURL + "KNQI", {method: "get", headers: new Headers({Authorization: "-opirCS9HHLxCqKScGB9H7J5N4zoV3G4VLiCHeD5RI8"})})
          //fetch("https://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&hoursBeforeNow=3&mostRecent=true&stationString=KNQI", {method: "GET", mode: "cors"})
          .then((function (t) {
            return t.json();
          }))
          .then((function (j) {
            NQIdone = true;
            var k_metar = document.getElementById("k_metar").innerHTML = j.raw;
            var k_temp = j.temperature.value;
            var k_altimeter = j.altimeter.value;
            var k_PA = j.pressure_altitude;
            var k_fieldElev = getFieldElev(k_altimeter, k_PA);
            var k_stationPressure = getStationPressure(k_altimeter, k_fieldElev);
            var k_RH = j.relative_humidity;
            var k_DR = getDensityRatio(k_temp, k_RH, k_stationPressure, true);
            document.getElementById("k_DR").innerHTML = k_DR.toString().substring(0, 5);
            document.getElementById("k_PA").innerHTML = k_PA;
            document.getElementById("k_T").innerHTML = Math.round(tempConv(k_temp, true));
            document.getElementById("k_rpm").innerHTML = getRPM(k_PA, k_temp, true);
            document.getElementById("k_line_half").innerHTML = getNormalLineSpeedHalf(k_DR);
            document.getElementById("k_line_full").innerHTML = getNormalLineSpeedFull(k_DR);
            document.getElementById("k_line_section").innerHTML = getSectionLineSpeed(k_DR);
            document.getElementById("k_TO_normal_half").innerHTML = getNormalTOHalf(k_DR);
            document.getElementById("k_TO_normal_full").innerHTML = getNormalTOFull(k_DR);
            document.getElementById("k_TO_section").innerHTML = getSectionTO(k_DR);
            document.getElementById("k_abort_dry_half").innerHTML = getAbortDryHalf(k_DR, 8);
            document.getElementById("k_abort_dry_full").innerHTML = getAbortDryFull(k_DR, 8);
            document.getElementById("k_abort_wet_half").innerHTML = getAbortWetHalf(k_DR, 8);
            document.getElementById("k_abort_wet_full").innerHTML = getAbortWetFull(k_DR, 8);
            document.getElementById("k_minRPM").innerHTML = getMinRPMatMRT(k_temp, true);
            NQItimePulled = j.time.dt;
          }
          ));
  await fetch(MasterURL + "KNMM", {method: "get", headers: new Headers({Authorization: "-opirCS9HHLxCqKScGB9H7J5N4zoV3G4VLiCHeD5RI8"})})
          .then((function (t) {
            return t.json();
          }))
          .then((function (j) {
            NMMdone = true;
            var m_metar = document.getElementById("m_metar").innerHTML = j.raw;
            var m_temp = j.temperature.value;
            var m_altimeter = j.altimeter.value;
            var m_PA = j.pressure_altitude;
            var m_fieldElev = getFieldElev(m_altimeter, m_PA);
            var m_stationPressure = getStationPressure(m_altimeter, m_fieldElev);
            var m_RH = j.relative_humidity;
            var m_DR = getDensityRatio(m_temp, m_RH, m_stationPressure, true);
            document.getElementById("m_DR").innerHTML = m_DR.toString().substring(0, 5);
            document.getElementById("m_PA").innerHTML = m_PA;
            document.getElementById("m_T").innerHTML = Math.round(tempConv(m_temp, true));
            document.getElementById("m_rpm").innerHTML = getRPM(m_PA, m_temp, true);
            document.getElementById("m_line_half").innerHTML = getNormalLineSpeedHalf(m_DR);
            document.getElementById("m_line_full").innerHTML = getNormalLineSpeedFull(m_DR);
            document.getElementById("m_line_section").innerHTML = getSectionLineSpeed(m_DR);
            document.getElementById("m_TO_normal_half").innerHTML = getNormalTOHalf(m_DR);
            document.getElementById("m_TO_normal_full").innerHTML = getNormalTOFull(m_DR);
            document.getElementById("m_TO_section").innerHTML = getSectionTO(m_DR);
            document.getElementById("m_abort_dry_half").innerHTML = getAbortDryHalf(m_DR, 8);
            document.getElementById("m_abort_dry_full").innerHTML = getAbortDryFull(m_DR, 8);
            document.getElementById("m_abort_wet_half").innerHTML = getAbortWetHalf(m_DR, 8);
            document.getElementById("m_abort_wet_full").innerHTML = getAbortWetFull(m_DR, 8);
            document.getElementById("m_minRPM").innerHTML = getMinRPMatMRT(m_temp, true);
            NMMtimePulled = j.time.dt;
          }
          ));
  await fetch(MasterURL + "KNJK", {method: "get", headers: new Headers({Authorization: "-opirCS9HHLxCqKScGB9H7J5N4zoV3G4VLiCHeD5RI8"})})
          .then((function (t) {
            return t.json();
          }))
          .then((function (j) {
            NJKdone = true;
            var c_metar = document.getElementById("c_metar").innerHTML = j.raw;
            var c_temp = j.temperature.value;
            var c_altimeter = j.altimeter.value;
            var c_PA = j.pressure_altitude;
            var c_RH = j.relative_humidity;
            var c_fieldElev = getFieldElev(c_altimeter, c_PA);
            var c_stationPressure = getStationPressure(c_altimeter, c_fieldElev);
            var c_DR = getDensityRatio(c_temp, c_RH, c_stationPressure, true);
            document.getElementById("c_DR").innerHTML = c_DR.toString().substring(0, 5);
            document.getElementById("c_PA").innerHTML = c_PA;
            document.getElementById("c_T").innerHTML = Math.round(tempConv(c_temp, true));
            document.getElementById("c_rpm").innerHTML = getRPM(c_PA, c_temp, true);
            document.getElementById("c_line_half").innerHTML = getNormalLineSpeedHalf(c_DR);
            document.getElementById("c_line_full").innerHTML = getNormalLineSpeedFull(c_DR);
            document.getElementById("c_line_section").innerHTML = getSectionLineSpeed(c_DR);
            document.getElementById("c_TO_normal_half").innerHTML = getNormalTOHalf(c_DR);
            document.getElementById("c_TO_normal_full").innerHTML = getNormalTOFull(c_DR);
            document.getElementById("c_TO_section").innerHTML = getSectionTO(c_DR);
            document.getElementById("c_abort_dry_half").innerHTML = getAbortDryHalf(c_DR, 9.5);
            document.getElementById("c_abort_wet_half").innerHTML = getAbortWetHalf(c_DR, 9.5);
            document.getElementById("c_minRPM").innerHTML = getMinRPMatMRT(c_temp, true);

            NJKtimePulled = j.time.dt;
          }
          ));
  updateTimeStamps();
  document.getElementById("loading").style.display = 'none';
}
/**
 * Called when Submit clicked, runway length changed, or 'Enter' key pressed 
 * when utilizing manual Station ID input. Fetches data and calculates TOLD.
 * @returns {undefined}
 */
async function updateStationID() {
  var stationID = document.getElementById("stationID").value;
  var q_ICAO, q_metar = "";
  var q_temp, q_altimeter, q_PA, q_fieldElev, q_stationPressure, q_RH, q_DR = 0;

  document.getElementById("loadingManual").style.display = 'none';
  if (stationID !== "" || typeof stationID !== 'string') {
    document.getElementById("loadingManual").style.display = 'block';
    await fetch(MasterURL + stationID, {method: "get", headers: new Headers({Authorization: "-opirCS9HHLxCqKScGB9H7J5N4zoV3G4VLiCHeD5RI8"})})
            .then((function (t) {
              console.log("FETCHING");
              return t.json();
            }))
            .then((function (j) {
              if (typeof j.error === 'undefined') {
                document.getElementById("q_metar_warn").style.display = 'block'
                var q_ICAO = document.getElementById("q_ICAO").innerHTML = j.station + " METAR";
                var q_metar = document.getElementById("q_metar").innerHTML = j.raw;
                var q_temp = j.temperature.value;
                var q_altimeter = j.altimeter.value;
                var q_PA = j.pressure_altitude;
                var q_fieldElev = getFieldElev(q_altimeter, q_PA);
                var q_stationPressure = getStationPressure(q_altimeter, q_fieldElev);
                var q_RH = j.relative_humidity;
                q_DR = getDensityRatio(q_temp, q_RH, q_stationPressure, true);
                qTimePulled = j.time.dt;
                var diff = minutesBetween(j.time.dt);
                document.getElementById("q_DR").innerHTML = q_DR.toString().substring(0, 5);
                document.getElementById("q_PA").innerHTML = q_PA;
                document.getElementById("q_T").innerHTML = Math.round(tempConv(q_temp, true));
                document.getElementById("q_rpm").innerHTML = getRPM(q_PA, q_temp, true);
                document.getElementById("q_line_half").innerHTML = getNormalLineSpeedHalf(q_DR);
                document.getElementById("q_line_full").innerHTML = getNormalLineSpeedFull(q_DR);
                document.getElementById("q_line_section").innerHTML = getSectionLineSpeed(q_DR);
                document.getElementById("q_TO_normal_half").innerHTML = getNormalTOHalf(q_DR);
                document.getElementById("q_TO_normal_full").innerHTML = getNormalTOFull(q_DR);
                document.getElementById("q_TO_section").innerHTML = getSectionTO(q_DR);
                calcStationIDAbortParams();
                document.getElementById("q_minRPM").innerHTML = getMinRPMatMRT(q_temp, true);
                
                document.getElementById("q_metar_warn").innerHTML = diff + " minutes ago";
                if (diff > expLimit) {
                  document.getElementById("q_warn_color").style = "color: red";
                } else {
                  document.getElementById("q_warn_color").style = "color: green";
                }
              } else {
                document.getElementById("q_ICAO").innerHTML = stationID + " not found. Please enter valid ICAO";
                document.getElementById("loadingManual").style.display = 'none';
              }

            }));
  } else {
    document.getElementById("q_ICAO").innerHTML = "*Enter valid ICAO*";
    document.getElementById("loadingManual").style.display = 'none';
  }
  document.getElementById("loadingManual").style.display = 'none';
}
/**
 * Separate method to update abort speeds for manual stationID that doesn't cost
 * an extra fetch request to help limit the number of pull requests from the 
 * server
 * @returns {undefined}
 */
function calcStationIDAbortParams() {
  var q_RL = document.getElementById("runwayLength").value / 1000;
  q_RL < 2 ? document.getElementById("RLWarning1").innerHTML = "<b>Runway Length < 2k, 2k will be used</b>"
          : q_RL > 10 ? document.getElementById("RLWarning1").innerHTML = "<b>Runway Length > 10k, 10k will be used</b>"
          : document.getElementById("RLWarning1").innerHTML = "";
  document.getElementById("q_abort_dry_half").innerHTML = getAbortDryHalf(q_DR, q_RL);
  document.getElementById("q_abort_dry_full").innerHTML = getAbortDryFull(q_DR, q_RL);
  document.getElementById("q_abort_wet_half").innerHTML = getAbortWetHalf(q_DR, q_RL);
  document.getElementById("q_abort_wet_full").innerHTML = getAbortWetFull(q_DR, q_RL);
}
/**
 * Called when any change made to manual TOLD Entry data fields changed.
 * @returns {undefined}
 */
function updateManualAll() {
  document.getElementById("q_ICAO").innerHTML = "Manual Data Calculation";
  document.getElementById("q_metar").innerHTML = "";
  var q_RL = document.getElementById("runwayLengthManual").value / 1000;
  var q_temp = document.getElementById("temperatureManual").value * 1;//*1 is needed to ensure that q_temp typeof is a number even when textbox is blank
  var q_altimeter = document.getElementById("altimeter").value;
  var q_fieldElev = document.getElementById("fieldElev").value * 1;
  var q_PA = (29.92 - q_altimeter) * 1000 + q_fieldElev;
  var cORf = document.getElementById("cORf").checked;//true if °C selected
  var q_stationPressure = q_altimeter * Math.exp(-0.0000366 * q_fieldElev);
  var q_DR = getDensityRatio(q_temp, 0.5, q_stationPressure, cORf);
  document.getElementById("q_DR").innerHTML = q_DR.toString().substring(0, 5);
  document.getElementById("q_PA").innerHTML = Math.round(q_PA * 1);

  document.getElementById("q_rpm").innerHTML = getRPM(q_PA, q_temp, cORf);
  document.getElementById("q_line_half").innerHTML = getNormalLineSpeedHalf(q_DR);
  document.getElementById("q_line_full").innerHTML = getNormalLineSpeedFull(q_DR);
  document.getElementById("q_line_section").innerHTML = getSectionLineSpeed(q_DR);
  document.getElementById("q_TO_normal_half").innerHTML = getNormalTOHalf(q_DR);
  document.getElementById("q_TO_normal_full").innerHTML = getNormalTOFull(q_DR);
  document.getElementById("q_TO_section").innerHTML = getSectionTO(q_DR);
  document.getElementById("q_abort_dry_half").innerHTML = getAbortDryHalf(q_DR, q_RL);
  document.getElementById("q_abort_dry_full").innerHTML = getAbortDryFull(q_DR, q_RL);
  document.getElementById("q_abort_wet_half").innerHTML = getAbortWetHalf(q_DR, q_RL);
  document.getElementById("q_abort_wet_full").innerHTML = getAbortWetFull(q_DR, q_RL);
  document.getElementById("q_minRPM").innerHTML = getMinRPMatMRT(q_temp, cORf);
  q_RL < 2 ? document.getElementById("RLWarning2").innerHTML = "<b>Runway Length < 2k, 2k will be used</b>"
          : q_RL > 10 ? document.getElementById("RLWarning2").innerHTML = "<b>Runway Length < 10k, 10k will be used</b>"
          : document.getElementById("RLWarning2").innerHTML = "";
  if (cORf) {
    document.getElementById("q_T").innerHTML = Math.round(tempConv(q_temp, cORf));
  } else {
    document.getElementById("q_T").innerHTML = q_temp;
  }

}
function updateTimeStamps() {
  var today = new Date();
  time = pad(today.getUTCHours(), 2) + "" + pad(today.getUTCMinutes(), 2) + " Z";
  document.getElementById("curTime").innerHTML = time;
  var NQIdiff = minutesBetween(NQItimePulled);
  var NMMdiff = minutesBetween(NMMtimePulled);
  var NJKdiff = minutesBetween(NJKtimePulled);
  var qDiff = minutesBetween(qTimePulled);
  document.getElementById("k_metar_warn").innerHTML = NQIdiff + " minutes ago";
  if (NQIdiff > expLimit) {
    document.getElementById("k_warn_color").style = "color: red";
  } else {
    document.getElementById("k_warn_color").style = "color: green";
  }
  var NMMdiff = minutesBetween(NMMtimePulled);
  document.getElementById("m_metar_warn").innerHTML = NMMdiff + " minutes ago";
  if (NMMdiff > expLimit) {
    document.getElementById("m_warn_color").style = "color: red";
  } else {
    document.getElementById("m_warn_color").style = "color: green";
  }
  var NJKdiff = minutesBetween(NJKtimePulled);
  document.getElementById("c_metar_warn").innerHTML = NJKdiff + " minutes ago";
  if (NJKdiff > expLimit) {
    document.getElementById("c_warn_color").style = "color: red";
  } else {
    document.getElementById("c_warn_color").style = "color: green";
  }
console.log("Q: "+qDiff);
  document.getElementById("q_metar_warn").innerHTML = qDiff + " minutes ago";
  if (qDiff > expLimit) {
    document.getElementById("q_warn_color").style = "color: red";
  } else {
    document.getElementById("q_warn_color").style = "color: green";
  }
}
initializeAll();

setInterval(updateTimeStamps, 30000);
//# sourceMappingURL=main.df526776.chunk.js.map