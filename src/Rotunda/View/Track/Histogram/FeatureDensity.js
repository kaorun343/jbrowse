define(['dojo/_base/declare',
	'dojo/Deferred',
        'Rotunda/View/Track/Histogram',
	'Rotunda/util'],
       function(declare,
		Deferred,
                Histogram,
		util) {

/**
 * @class
 */
return declare (Histogram,
{
    constructor: function(config) {
	if ('trackConfig' in config) {
	    if ('style' in config.trackConfig && 'histCss' in config.trackConfig.style)
		this.className = config.trackConfig.style.histCss
	    else if ('histograms' in config.trackConfig && 'color' in config.trackConfig.histograms)
		this.histColor = config.trackConfig.histograms.color
	}

	this.highColor = this.lowColor = this.histColor || this.cssColor() || 'goldenrod'
    },

    baselineScore: 0,
    maxScoreLowBound: 1,

    pixelsPerBin: 10,
    buildHistogramForView: function (rot, minRadius, maxRadius, callback, errorCallback) {
	var track = this
	var basesPerBin = rot.basesPerPixel(rot.scale,minRadius) * track.pixelsPerBin
	basesPerBin = Math.pow (2, Math.ceil (Math.log(basesPerBin) / Math.log(2)))  // round to nearest power of 2

	track.getStoresInView (rot, null, function (data) {
	    var stores = data.stores
	    var intervals = data.intervals
	    var nQueriesLeft = intervals.length
	    var def = new Deferred()
	    var features = []
	    intervals.forEach (function (interval) {
		var store = stores[interval.seq]
		var intervalDef = new Deferred()
		intervalDef.then (function (intervalFeatures) {
		    if (intervalFeatures)
			features = features.concat (intervalFeatures)
		    if (--nQueriesLeft == 0)
			def.resolve()
		})

		store.getGlobalStats
		(function (stats) {
		    if (stats.featureDensity > 0) {
			var roundedIntervalStart = interval.start - (interval.start % basesPerBin)
			var roundedIntervalEnd = interval.end - (interval.end % basesPerBin) + basesPerBin
			if (store.getRegionFeatureDensities) {
			    var query = {
				ref:   interval.seq,
				start: roundedIntervalStart,
				end:   roundedIntervalEnd,
				basesPerSpan: basesPerBin,
				basesPerBin: basesPerBin
			    }
			    store.getRegionFeatureDensities
			    (query,
			     function (histData) {
				 var features = histData.bins.map (function (score, nBin) {
				     return { seq: query.ref,
					      start: query.start + nBin * basesPerBin,
					      end: query.start + (nBin + 1) * basesPerBin,
					      score: isNaN(score) ? 0 : score  }
				 })
				 intervalDef.resolve (features)
			     },
			     function (error) {
				 intervalDef.resolve()
			     })
			} else {
			    var nBins = (roundedIntervalEnd - roundedIntervalStart) / basesPerBin
			    var nBinsLeft = nBins
			    for (var nBin = 0; nBin < nBins; ++nBin)
				(function (nBin) {
				    var binStart = roundedIntervalStart + nBin * basesPerBin
				    var binEnd = binStart + basesPerBin - 1
				    store.getRegionStats
				    ( { ref: interval.seq,
					start: binStart,
					end: binEnd },
				      function (stats) {
					  features.push ( { seq: interval.seq,
							    start: binStart,
							    end: binEnd,
							    score: stats.featureCount } )
					  if (--nBinsLeft == 0)
					      intervalDef.resolve (features)
				      },
				      function (error) {
					  features.push ( { seq: interval.seq,
							    start: binStart,
							    end: binEnd,
							    score: 0 } )
					  if (--nBinsLeft == 0)
					      intervalDef.resolve (features)
				      } )
				}) (nBin)
			}

		    } else
			intervalDef.resolve ( [{ seq: interval.seq,
						 start: interval.start,
						 end: interval.end,
						 score: 0 }] )
		},
		 function(e) {
		     intervalDef.resolve()
		 })
	    })
	    def.then (function() {
		callback (features)
	    })
	})
    },
})

});