define([
           'dojo/_base/declare',
           'dojo/_base/array',
           'dojo/Deferred',
           'JBrowse/Errors',
           'JBrowse/Store/SeqFeature/GlobalStatsEstimationMixin'
       ],
       function( declare, array, Deferred, Errors, GlobalStats ) {

return declare( GlobalStats, {

    async _estimateGlobalStats(refseq) {
        refseq = refseq || this.refSeq
        let featCount
        if (this.indexedData) {
			featCount = this.indexedData.featureCount(refseq.name);
        } else if (this.bam) {
            const chr = this.browser.regularizeReferenceName(refseq.name)
            const chrId = this.bam.chrToIndex && this.bam.chrToIndex[chr]
			featCount = await this.bam.index.lineCount(chrId, true)
        }
        if (featCount == -1) {
            return this.inherited('_estimateGlobalStats', arguments)
        }
        const featureDensity = featCount / (refseq.end - refseq.start)
        return { featureDensity }
    }

});
});
