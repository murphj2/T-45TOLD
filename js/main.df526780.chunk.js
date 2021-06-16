var FullWet = [
  [1.3, 2, 2.7, 3.3, 3.8, 4.35, 4.85, 5.35, 5.8],
  [1.275, 1.95, 2.6, 3.2, 3.7, 4.15, 4.65, 5.1, 5.55],
  [1.25, 1.9, 2.55, 3.05, 3.55, 4, 4.45, 4.8, 5.3],
  [1.2, 1.85, 2.45, 2.95, 3.4, 3.85, 4.25, 4.65, 5.05],
  [1.175, 1.8, 2.35, 2.85, 3.3, 3.7, 4.05, 4.45, 4.8],
  [1.15, 1.7, 2.25, 2.75, 3.15, 3.5, 3.9, 4.2, 4.55],
  [1.125, 1.65, 2.15, 2.6, 3, 3.35, 3.7, 4, 4.3],
  [1.1, 1.6, 2.05, 2.45, 2.85, 3.2, 3.5, 3.8, 4.05]
];
var FullDry = [
  [2.15, 3.2, 3.95, 4.6, 5.25, 5.8, 6.25, 6.7, 7.1],
  [2.1, 3.1, 3.85, 4.5, 5.05, 5.55, 6.05, 6.45, 6.85],
  [2, 2.95, 3.7, 4.3, 4.85, 5.35, 5.8, 6.2, 6.6],
  [1.95, 2.85, 3.55, 4.15, 4.65, 5.1, 5.55, 5.95, 6.35],
  [1.85, 2.75, 3.4, 3.95, 4.45, 4.9, 5.3, 5.65, 6.05],
  [1.75, 2.6, 3.25, 3.8, 4.25, 4.65, 5.05, 5.4, 5.75],
  [1.7, 2.45, 3.1, 3.6, 4.05, 4.45, 4.8, 5.1, 5.45],
  [1.6, 2.3, 2.95, 3.45, 3.85, 4.2, 4.55, 4.85, 5.15]
];
var HalfWet = [
  [1.25, 2.05, 2.6, 3.2, 3.65, 4.15, 4.65, 5.05, 5.45],
  [1.25, 2, 2.55, 3.1, 3.55, 4, 4.45, 4.85, 5.25],
  [1.25, 1.95, 2.5, 3.025, 3.45, 3.875, 4.3, 4.7, 5.05],
  [1.225, 1.9, 2.425, 2.9, 3.35, 3.725, 4.1, 4.5, 4.85],
  [1.2, 1.825, 2.35, 2.8, 3.2, 3.55, 3.9, 4.3, 4.6],
  [1.15, 1.75, 2.25, 2.7, 3.05, 3.4, 3.75, 4.1, 4.4],
  [1.1, 1.65, 2.15, 2.6, 2.9, 3.25, 3.55, 3.9, 4.15],
  [1.05, 1.6, 2.1, 2.5, 2.8, 3.1, 3.4, 3.7, 2.95]
];
var HalfDry = [
  [1.2, 2.2, 3, 3.75, 4.3, 4.9, 5.4, 5.85, 6.3],
  [1.15, 2.1, 2.9, 3.55, 4.15, 4.7, 5.2, 5.65, 6.05],
  [1.1, 2, 2.75, 3.4, 3.95, 4.5, 4.95, 5.4, 5.8],
  [1.05, 1.9, 2.6, 3.25, 3.8, 4.3, 4.7, 5.15, 5.5],
  [0.95, 1.8, 2.5, 3.05, 3.6, 4.05, 4.5, 4.85, 5.2],
  [0.85, 1.65, 2.35, 2.9, 3.4, 3.85, 4.25, 4.6, 4.95],
  [0.75, 1.55, 2.15, 2.7, 3.15, 3.6, 3.95, 4.3, 4.6],
  [0.65, 1.4, 2, 2.45, 2.9, 3.3, 3.65, 4, 4.3]
];
var AbortDR = [1.05, 1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7];
var AbortRL = [2, 3, 4, 5, 6, 7, 8, 9, 10];
var MasterURL = "https://avwx.rest/api/metar/";
var refreshing = !1;
var time = 0;
var expLimit=75;
function search() {
  if (event.keyCode === 13) {
    updateAll();
  }
}
function pad(t, e) {
  for (t = t.toString(); t.length < e; )
    t = "0" + t;
  return t;
}
function getRPM(PA, temp, tempIsC) {
  var rpm = 56.5 + (PA / 1500) + ((temp - 15) / 10);
  if (tempIsC) {
    temp = (temp * (9 / 5)) + 32;
  }
  rpm = Math.round(rpm * 10) / 10;
  return rpm;
}
function getDensityRatio(temp, PA, RH, altimeter, tempIsC) {
  var dr;
  if (RH === 0) {
    if (tempIsC) {
      temp = (temp * (9 / 5)) + 32;
    }
    dr = 1.1257876 * Math.exp(-0.0019389 * temp) - ((PA / 2000) * 0.07);
    return dr;
  } else {
    var p1 = 6.1078 * 10 ^ [7.5 * (temp + 273.15) / ((temp + 273.15) + 237.3)];
    var pv = p1 * RH;
    var pd = (altimeter * 3386.388666666) - pv;
    var curDens = (pd / (287.058 * (temp + 273.15))) + (pv / (461.495 * (temp + 273.15)));
    dr = curDens / 1.225
    return dr;
  }
}
function isMoreThan2HoursOld(timeStamp) {
  var obs = new Date(timeStamp);
  var today = new Date();
  var diff = (today - obs) / 60000;
  return Math.round(diff);
}
function getNormalLineSpeedHalf(DR) {
  var LS = 60.47936 * Math.exp(0.6016 * DR);
  LS = Math.round(LS * 10) / 10;
  return LS;
}
function getBaro(Pa) {
  return Pa * 0.00029530;
}
function getURL(stID) {
  return "https://api.weather.gov/stations/" + stID + "/observations/latest?require_qc=true";
}
function getNormalLineSpeedFull(DR) {
  var LS = 106.941256 * (Math.pow(DR, 0.995592));
  LS = Math.round(LS * 10) / 10;
  return LS;
}
function getSectionLineSpeed(DR) {
  var LS = 31.798985 * Math.exp(1.192471 * DR);
  LS = Math.round(LS * 10) / 10;
  return LS;
}
function getNormalTOHalf(DR) {
  var TOD = 27962.2164378757 * Math.exp(-2.510794011937820 * DR);
  TOD = Math.round(TOD);
  return TOD;
}
function getNormalTOFull(DR) {
  var TOD = 20770.0443790002 * Math.exp(-2.4730121317097 * DR)
  TOD = Math.round(TOD);
  return TOD;
}
function getSectionTO(DR) {
  var TOD = 26108.1555973667 * Math.exp(-2.3670135208 * DR)
  TOD = Math.round(TOD);
  return TOD;
}
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
  abortspeed = Math.round(abortspeed * 10) / 10;
  return abortspeed;
}
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
  abortspeed = Math.round(abortspeed * 10) / 10;
  return abortspeed;
}
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
  abortspeed = Math.round(abortspeed * 10) / 10;
  return abortspeed;
}
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
  abortspeed = Math.round(abortspeed * 10) / 10;
  return abortspeed;
}
function getMinRPMatMRT(temp, tempIsC) {
  if (tempIsC) {
    temp = (temp * (9 / 5)) + 32;
  }
  return temp > 51 ? 97
          : temp >= 37 ? 96
          : temp >= 21 ? 95
          : temp >= 9 ? 94
          : temp >= -5 ? 93
          : 92;
}
function dataEnterMethod() {
  var manualData = document.getElementById("entryMethod").checked;
  if (manualData) {
    document.getElementById("airportData").style.display = 'none';
    document.getElementById("manualData").style.display = 'block';
  } else {
    document.getElementById("airportData").style.display = 'block';
    document.getElementById("manualData").style.display = 'none';
  }
}
function update3MainFields() {
  dataEnterMethod();
  var today = new Date();
  time = pad(today.getUTCHours(), 2) + "" + pad(today.getUTCMinutes(), 2) + " Z";
  document.getElementById("refreshtime").innerHTML = time;
  //fetch(MasterURL + "KNQI", {method: "get", headers: new Headers({Authorization: "-opirCS9HHLxCqKScGB9H7J5N4zoV3G4VLiCHeD5RI8"})})
  fetch("https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&hoursBeforeNow=3&mostRecent=true&stationString=KNQI",{method: "GET", mode:"cors"})
          .then((function (t) {
            console.log(t.url);
            return t.json();
          }))
          .then((function (j) {
            console.log(j);
            j = j.properties;
            console.log(j);
            var k_metar = document.getElementById("k_metar").innerHTML = j.rawMessage;
            var k_temp = j.temperature.value;
            var k_altimeter = getBaro(j.barometricPressure.value); //Baro is in Pa, need inHg
            var k_PA = (29.92 - k_altimeter) * 1000 + (j.elevation.value * 3.28084)//m to ft
            var k_RH = j.relativeHumidity.value / 100;
            var k_DR = getDensityRatio(k_temp, k_PA, k_RH, k_altimeter, true);
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
            var diff = isMoreThan2HoursOld(j.timestamp);
            document.getElementById("k_metar_warn").innerHTML =  diff + " minutes ago";
                if (diff > expLimit) {
                  document.getElementById("k_warn_color").style =  "color: red";
                } else {
                  document.getElementById("k_warn_color").style =  "color: green";
                }
              }
          ));
  fetch(getURL("KNMM"))
          .then((function (t) {
            return t.json();
          }))
          .then((function (j) {
            j = j.properties;
            console.log(j);
            var m_metar = document.getElementById("m_metar").innerHTML = j.rawMessage;
            var m_temp = j.temperature.value;
            var m_altimeter = getBaro(j.barometricPressure.value);
            var m_PA = (29.92 - m_altimeter) * 1000 + (j.elevation.value * 3.28084);
            var m_RH = j.relativeHumidity.value / 100;
            var m_DR = getDensityRatio(m_temp, m_PA, m_RH, m_altimeter, true);
            console.log("KNMM PA: " + m_altimeter);
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
            var diff = isMoreThan2HoursOld(j.timestamp);
                if (diff > expLimit) {
                  document.getElementById("m_metar_warn").innerHTML =  diff + " minutes ago";
                } else {
                  document.getElementById("m_metar_warn").innerHTML = "";
                }
              }
          ));
  fetch(getURL("KNJK"))
          .then((function (t) {
            return t.json();
          }))
          .then((function (j) {
            j = j.properties;
            var c_metar = document.getElementById("c_metar").innerHTML = j.rawMessage;
            var c_temp = j.temperature.value;
            var c_altimeter = getBaro(j.barometricPressure.value);
            var c_PA = (29.92 - c_altimeter) * 1000 + (j.elevation.value * 3.28084);
            var c_RH = j.relativeHumidity.value / 100;
            var c_DR = getDensityRatio(c_temp, c_PA, c_RH, c_altimeter, true);
            document.getElementById("c_rpm").innerHTML = getRPM(c_PA, c_temp, true);
            document.getElementById("c_line_half").innerHTML = getNormalLineSpeedHalf(c_DR);
            document.getElementById("c_line_full").innerHTML = getNormalLineSpeedFull(c_DR);
            document.getElementById("c_line_section").innerHTML = getSectionLineSpeed(c_DR);
            document.getElementById("c_TO_normal_half").innerHTML = getNormalTOHalf(c_DR);
            document.getElementById("c_TO_normal_full").innerHTML = getNormalTOFull(c_DR);
            document.getElementById("c_TO_section").innerHTML = getSectionTO(c_DR);
            document.getElementById("c_abort_dry_half").innerHTML = getAbortDryHalf(c_DR, 9.5);
            //document.getElementById("c_abort_dry_full").innerHTML = getAbortDryFull(c_DR, 8);
            document.getElementById("c_abort_wet_half").innerHTML = getAbortWetHalf(c_DR, 9.5);
            //document.getElementById("c_abort_wet_full").innerHTML = getAbortWetFull(c_DR, 8);
            document.getElementById("c_minRPM").innerHTML = getMinRPMatMRT(c_temp, true);
            var diff = isMoreThan2HoursOld(j.timestamp);
                if (diff > expLimit) {
                  document.getElementById("c_metar_warn").innerHTML =  diff + " minutes ago";
                } else {
                  document.getElementById("c_metar_warn").innerHTML = "";
                }
              }
          ));
}
function updateAll() {
  update3MainFields();
  var stationID = document.getElementById("stationID").value;
  var q_RL = document.getElementById("runwayLength").value / 1000;
  q_RL < 2 ? document.getElementById("RLWarning1").innerHTML = "<b>Runway Length < 2k, 2k will be used</b>"
          : q_RL > 10 ? document.getElementById("RLWarning1").innerHTML = "<b>Runway Length < 10k, 10k will be used</b>"
          : document.getElementById("RLWarning1").innerHTML = "";
  if (stationID !== "" || typeof stationID !== 'string') {
    fetch(getURL(stationID))
            .then((function (t) {
              return t.json();
            }))
            .then((function (j) {
              console.log("INPUTTTT");
              console.log(j);

              if (j.type === "Feature") {
                j = j.properties;
                var q_ICAO = document.getElementById("q_ICAO").innerHTML = j.rawMessage.substring(0, 4) + " METAR";
                var q_metar = document.getElementById("q_metar").innerHTML = j.rawMessage;
                var q_temp = j.temperature.value;
                var q_altimeter = getBaro(j.barometricPressure.value);
                var q_PA = (29.92 - q_altimeter) * 1000 + (j.elevation.value * 3.28084);
                var q_RH = j.relativeHumidity.value / 100;
                var q_DR = getDensityRatio(q_temp, q_PA, q_RH, q_altimeter, true);
                document.getElementById("q_rpm").innerHTML = getRPM(q_PA, q_temp, true);
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
                document.getElementById("q_minRPM").innerHTML = getMinRPMatMRT(q_temp, true);
                var diff = isMoreThan2HoursOld(j.timestamp);
                if (diff > expLimit) {
                  document.getElementById("q_metar_warn").innerHTML =  diff + " minutes ago";
                } else {
                  document.getElementById("q_metar_warn").innerHTML = "";
                }
              } else {
                document.getElementById("q_ICAO").innerHTML = stationID + " not found. Please enter valid ICAO";
              }
            }));
  } else {
    document.getElementById("q_ICAO").innerHTML = "*Enter valid ICAO*";
  }

}
function updateManualAll() {
  update3MainFields();
  document.getElementById("q_ICAO").innerHTML = "Manual Data Calculation";
  document.getElementById("q_metar").innerHTML = "";
  var q_RL = document.getElementById("runwayLengthManual").value / 1000;
  var q_temp = document.getElementById("temperatureManual").value;
  var q_altimeter = document.getElementById("altimeter").value;
  var q_PA = (29.92 - q_altimeter) * 1000 + document.getElementById("fieldElev").value;
  var cORf = document.getElementById("cORf").checked;
  var q_DR = getDensityRatio(q_temp, q_PA, 0, q_altimeter, cORf);
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
  //} else {
  //document.getElementById("q_ICAO").innerHTML = "*Enter valid ICAO*";
  //}
}
//document.getElementById("getICAOinfo").addEventListener("onClick",updateAll());

update3MainFields();
//# sourceMappingURL=main.df526776.chunk.js.map