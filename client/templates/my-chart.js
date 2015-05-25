// my-chart.js

Template.myChart.helpers({

	getRandomId: function(){
		return Math.random().toString(36).substring(7);
	},


  stockChart: function(){
  	return {
  		chart: {
        type: 'line'
      },
	    rangeSelector : {
        selected : 1
	    },
	    title : {
	      text : 'AAPL Stock Price'
	    },
	    series : [{
	      name : 'AAPL',
	      data : [

	      	[1147651200000,67.79],
					[1147737600000,64.98],
					[1147824000000,65.26],
					[1147910400000,63.18],
					[1147996800000,64.51],
					[1148256000000,63.38],
					[1148342400000,63.15],
					[1148428800000,63.34],
					[1148515200000,64.33],
					[1148601600000,63.55],
					[1148947200000,61.22],
					[1149033600000,59.77],
					/* Jun 2006 */
					[1149120000000,62.17],
					[1149206400000,61.66],
					[1149465600000,60.00],
					[1149552000000,59.72],
					[1149638400000,58.56],
					[1149724800000,60.76],
					[1149811200000,59.24],
					[1150070400000,57.00],
					[1150156800000,58.33],
					[1150243200000,57.61],
					[1150329600000,59.38],
					[1150416000000,57.56],
					[1150675200000,57.20],
					[1150761600000,57.47],
					[1150848000000,57.86],
					[1150934400000,59.58],
					[1151020800000,58.83],
					[1151280000000,58.99],
					[1151366400000,57.43],
					[1151452800000,56.02],
					[1151539200000,58.97],
					[1151625600000,57.27],
					/* Jul 2006 */
					[1151884800000,57.95],
					[1152057600000,57.00],
					[1152144000000,55.77],
					[1152230400000,55.40],
					[1152489600000,55.00],
					[1152576000000,55.65],
					[1152662400000,52.96],
					[1152748800000,52.25],
					[1152835200000,50.67],
					[1153094400000,52.37],
					[1153180800000,52.90],
					[1153267200000,54.10],
					[1153353600000,60.50],
					[1153440000000,60.72],
					[1153699200000,61.42],
					[1153785600000,61.93],
					[1153872000000,63.87],
					[1153958400000,63.40],
					[1154044800000,65.59],
					[1154304000000,67.96],
					/* Aug 2006 */
					[1154390400000,67.18],
					[1154476800000,68.16],
					[1154563200000,69.59],
					[1154649600000,68.30],
					[1154908800000,67.21],
					[1154995200000,64.78],
					[1155081600000,63.59],
					[1155168000000,64.07],
					[1155254400000,63.65],
					[1155513600000,63.94],
					[1155600000000,66.45],
					[1155686400000,67.98],
					[1155772800000,67.59],
					[1155859200000,67.91],
					[1156118400000,66.56],
					[1156204800000,67.62],
					[1156291200000,67.31],
					[1156377600000,67.81],
					[1156464000000,68.75],
					[1156723200000,66.98],
					[1156809600000,66.48],
					[1156896000000,66.96],
					[1156982400000,67.85],
					/* Sep 2006 */
					[1157068800000,68.38],
					[1157414400000,71.48],
					[1157500800000,70.03],
					[1157587200000,72.80],
					[1157673600000,72.52],
					[1157932800000,72.50],
					[1158019200000,72.63],
					[1158105600000,74.20],
					[1158192000000,74.17],
					[1158278400000,74.10],
					[1158537600000,73.89],
					[1158624000000,73.77],
					[1158710400000,75.26],
					[1158796800000,74.65],
					[1158883200000,73.00],
					[1159142400000,75.75],
					[1159228800000,77.61],
					[1159315200000,76.41],
					[1159401600000,77.01],
					[1159488000000,76.98],
					/* Oct 2006 */
					[1159747200000,74.86],
					[1159833600000,74.08],
					[1159920000000,75.38],
					[1160006400000,74.83],
					[1160092800000,74.22],
					[1160352000000,74.63],
					[1160438400000,73.81],
					[1160524800000,73.23],
					[1160611200000,75.26],
					[1160697600000,75.02],
					[1160956800000,75.40],
					[1161043200000,74.29],
					[1161129600000,74.53],
					[1161216000000,78.99],
					[1161302400000,79.95],
					[1161561600000,81.46],
					[1161648000000,81.05],
					[1161734400000,81.68],
					[1161820800000,82.19],
					[1161907200000,80.41],
					[1162166400000,80.42],
					[1162252800000,81.08],
					/* Nov 2006 */
					[1162339200000,79.16],
					[1162425600000,78.98],
					[1162512000000,78.29],
					[1162771200000,79.71],
					[1162857600000,80.51],
					[1162944000000,82.45],
					[1163030400000,83.34],
					[1163116800000,83.12],
					[1163376000000,84.35],
					[1163462400000,85.00],
					[1163548800000,84.05],
					[1163635200000,85.61],
					[1163721600000,85.85],
					[1163980800000,86.47],
					[1164067200000,88.60],
					[1164153600000,90.31],
					[1164326400000,91.63],
					[1164585600000,89.54],
					[1164672000000,91.81],
					[1164758400000,91.80],
					[1164844800000,91.66],
					/* Dec 2006 */
					[1164931200000,91.32],
					[1165190400000,91.12],
					[1165276800000,91.27],
					[1165363200000,89.83],
					[1165449600000,87.04],
					[1165536000000,88.26],
					[1165795200000,88.75],
					[1165881600000,86.14],
					[1165968000000,89.05],
					[1166054400000,88.55],
					[1166140800000,87.72],
					[1166400000000,85.47],
					[1166486400000,86.31],
					[1166572800000,84.76],
					[1166659200000,82.90],
					[1166745600000,82.20],
					[1167091200000,81.51],
					[1167177600000,81.52],
					[1167264000000,80.87],
					[1167350400000,84.84],
					/* Jan 2007 */
					[1167782400000,83.80],
					[1167868800000,85.66],
					[1167955200000,85.05],
					[1168214400000,85.47],
					[1168300800000,92.57],
					[1168387200000,97.00],
					[1168473600000,95.80],
					[1168560000000,94.62],
					[1168905600000,97.10],
					[1168992000000,94.95],
					[1169078400000,89.07],
					[1169164800000,88.50],
					[1169424000000,86.79],
					[1169510400000,85.70],
					[1169596800000,86.70],
					[1169683200000,86.25],
					[1169769600000,85.38],
					[1170028800000,85.94],
					[1170115200000,85.55],
					[1170201600000,85.73],
					/* Feb 2007 */
					[1170288000000,84.74],
					[1170374400000,84.75],
					[1170633600000,83.94],
					[1170720000000,84.15],
					[1170806400000,86.15],
					[1170892800000,86.18],
					[1170979200000,83.27],
					[1171238400000,84.88],
					[1171324800000,84.63],
					[1171411200000,85.30],
					[1171497600000,85.21],
					[1171584000000,84.83],
					[1171929600000,85.90],
					[1172016000000,89.20],
					[1172102400000,89.51],
					[1172188800000,89.07],
					[1172448000000,88.65],
					[1172534400000,83.93],
					[1172620800000,84.61],
					/* Mar 2007 */
					[1172707200000,87.06],
					[1172793600000,85.41],
					[1173052800000,86.32],
					[1173139200000,88.19],
					[1173225600000,87.72],
					[1173312000000,88.00],
					[1173398400000,87.97],
					[1173657600000,89.87],
					[1173744000000,88.40],
					[1173830400000,90.00],
					[1173916800000,89.57],
					[1174003200000,89.59],
					[1174262400000,91.13],
					[1174348800000,91.48],
					[1174435200000,93.87],
					[1174521600000,93.96],
					[1174608000000,93.52],
					[1174867200000,95.85],
					[1174953600000,95.46],
					[1175040000000,93.24],
					[1175126400000,93.75],
					[1175212800000,92.91],
					/* Apr 2007 */
					[1175472000000,93.65],
					[1175558400000,94.50],
					[1175644800000,94.27],
					[1175731200000,94.68],
					[1176076800000,93.65],
					[1176163200000,94.25],
					[1176249600000,92.59],
					[1176336000000,92.19],
					[1176422400000,90.24],
					[1176681600000,91.43],
					[1176768000000,90.35],
					[1176854400000,90.40],
					[1176940800000,90.27],
					[1177027200000,90.97],
					[1177286400000,93.51],
					[1177372800000,93.24],
					[1177459200000,95.35],
					[1177545600000,98.84],
					[1177632000000,99.92],
					[1177891200000,99.80],
					/* May 2007 */
					[1177977600000,99.47],
					[1178064000000,100.39],
					[1178150400000,100.40],
					[1178236800000,100.81],
					[1178496000000,103.92],
					[1178582400000,105.06],
					[1178668800000,106.88],
					[1178755200000,107.34],
					[1178841600000,108.74],
					[1179100800000,109.36],
					[1179187200000,107.52],
					[1179273600000,107.34],
					[1179360000000,109.44],
					[1179446400000,110.02],
					[1179705600000,111.98],
					[1179792000000,113.54],
					[1179878400000,112.89],
					[1179964800000,110.69],
					[1180051200000,113.62],
					[1180396800000,114.35],
					[1180483200000,118.77],
					[1180569600000,121.19],
					/* Jun 2007 */
					[1180656000000,118.40],
					[1180915200000,121.33],
					[1181001600000,122.67],
					[1181088000000,123.64],
					[1181174400000,124.07],
					[1181260800000,124.49],
					[1181520000000,120.19],
					[1181606400000,120.38],
					[1181692800000,117.50],
					[1181779200000,118.75],
					[1181865600000,120.50],
					[1182124800000,125.09],
					[1182211200000,123.66],
					[1182297600000,121.55],
					[1182384000000,123.90],
					[1182470400000,123.00],
					[1182729600000,122.34],
					[1182816000000,119.65],
					[1182902400000,121.89],
					[1182988800000,120.56],
					[1183075200000,122.04],
					/* Jul 2007 */
					[1183334400000,121.26],
					[1183420800000,127.17],
					[1183593600000,132.75],
					[1183680000000,132.30],
					[1183939200000,130.33],
					[1184025600000,132.35],
					[1184112000000,132.39],
					[1184198400000,134.07],
					[1184284800000,137.73],
					[1184544000000,138.10],
					[1184630400000,138.91],
					[1184716800000,138.12],
					[1184803200000,140.00],
					[1184889600000,143.75],
					[1185148800000,143.70],
					[1185235200000,134.89],
					[1185321600000,137.26],
					[1185408000000,146.00],
					[1185494400000,143.85],
					[1185753600000,141.43],
					[1185840000000,131.76],
					/* Aug 2007 */
					[1185926400000,135.00],
					[1186012800000,136.49],
					[1186099200000,131.85],
					[1186358400000,135.25],
					[1186444800000,135.03],
					[1186531200000,134.01],
					[1186617600000,126.39],
					[1186704000000,125.00],
					[1186963200000,127.79],
					[1187049600000,124.03],
					[1187136000000,119.90],
					[1187222400000,117.05],
					[1187308800000,122.06],
					[1187568000000,122.22],
					[1187654400000,127.57],
					[1187740800000,132.51],
					[1187827200000,131.07],
					[1187913600000,135.30],
					[1188172800000,132.25],
					[1188259200000,126.82],
					[1188345600000,134.08],
					[1188432000000,136.25],
					[1188518400000,138.48],
					/* Sep 2007 */
					[1188864000000,144.16],
					[1188950400000,136.76],
					[1189036800000,135.01],
					[1189123200000,131.77],
					[1189382400000,136.71],
					[1189468800000,135.49],
					[1189555200000,136.85],
					[1189641600000,137.20],
					[1189728000000,138.81],
					[1189987200000,138.41],
					[1190073600000,140.92],
					[1190160000000,140.77],
					[1190246400000,140.31],
					[1190332800000,144.15],
					[1190592000000,148.28],
					[1190678400000,153.18],
					[1190764800000,152.77],
					[1190851200000,154.50],
					[1190937600000,153.47]

	      ],
	      tooltip: {
	          valueDecimals: 2
	      }
	    }]
  	};
  },

  ////////////// AREA CHART

  areaChart: function(){
    	return {
        chart: {
            type: 'area'
        },
        title: {
            text: 'US and USSR nuclear stockpiles'
        },
        subtitle: {
            text: 'Source: <a href="http://thebulletin.metapress.com/content/c4120650912x74k7/fulltext.pdf">' +
                'thebulletin.metapress.com</a>'
        },
        xAxis: {
            allowDecimals: false,
            labels: {
                formatter: function () {
                    return this.value; // clean, unformatted number for year
                }
            }
        },
        yAxis: {
            title: {
                text: 'Nuclear weapon states'
            },
            labels: {
                formatter: function () {
                    return this.value / 1000 + 'k';
                }
            }
        },
        tooltip: {
            pointFormat: '{series.name} produced <b>{point.y:,.0f}</b><br/>warheads in {point.x}'
        },
        plotOptions: {
            area: {
                pointStart: 1940,
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: [
        {
            name: 'USA',
            data: [null, null, null, null, null, 6, 11, 32, 110, 235, 369, 640,
                1005, 1436, 2063, 3057, 4618, 6444, 9822, 15468, 20434, 24126,
                27387, 29459, 31056, 31982, 32040, 31233, 29224, 27342, 26662,
                26956, 27912, 28999, 28965, 27826, 25579, 25722, 24826, 24605,
                24304, 23464, 23708, 24099, 24357, 24237, 24401, 24344, 23586,
                22380, 21004, 17287, 14747, 13076, 12555, 12144, 11009, 10950,
                10871, 10824, 10577, 10527, 10475, 10421, 10358, 10295, 10104]
        }
        ,{
            name: 'USSR/Russia',
            data: [null, null, null, null, null, null, null, null, null, null,
                5, 25, 50, 120, 150, 200, 426, 660, 869, 1060, 1605, 2471, 3322,
                4238, 5221, 6129, 7089, 8339, 9399, 10538, 11643, 13092, 14478,
                15915, 17385, 19055, 21205, 23044, 25393, 27935, 30062, 32049,
                33952, 35804, 37431, 39197, 45000, 43000, 41000, 39000, 37000,
                35000, 33000, 31000, 29000, 27000, 25000, 24000, 23000, 22000,
                21000, 20000, 19000, 18000, 18000, 17000, 16000]
        }
        ]
    };
  }
});


