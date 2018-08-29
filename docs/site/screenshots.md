---
id: screenshots
title: Automating screenshots of JBrowse
---

## Rendering high resolution screenshots using PhantomJS

Using the command line tool phantomjs, you can produce a screenshot of JBrowse which includes high resolution canvas features. First get phantomJS and rasterize.js (http://phantomjs.org/screen-capture.html).

Then produce the screenshot using the syntax `phantomjs rasterize.js <url> <output file> <dimensions> <zoom factor>`

```
phantomjs rasterize.js 'http://your.jbrowse/?loc=ctgA:1..10000&tracks=DNA,Genes' jbrowse.png '4800px*2600px' 4
phantomjs rasterize.js 'http://your.jbrowse/?loc=ctgA:1..10000&tracks=DNA,Genes' jbrowse.pdf
```

Caveats

-   High resolution canvas features requires setting something like highResolutionMode=4 (match the zoom factor essentially). Reason being is that devicePixelRatio detection isn't supported so highResolutionMode=auto doesn't work.
-   A bugfix for phantomJS was added in 1.11.5 for release versions of JBrowse, so previous releases of JBrowse may get blank screenshots in phantomjs
-   PDF output works in PhantomJS 2.0+
-   The default browser HTML form elements do not scale well, including those on the hierarchical track panel, so taking the screenshot with &tracklist=0 will look better. As an example about how the HTML form elements appear, see this showing the effect of different zoom factor levels, but the problem being that the form elements remain tiny at larger zoom levels [2](http://i.imgur.com/vSmRjLO.png)
-   The default timeout for rasterize.js is small (200 ms) and you can increase this if you are getting a blank screenshot
-   When you are exporting PDF, avoid setting dimensions (instead of 4800px\*2600px like for png, pdf can accept something like 11in\*8in, but don't use this!) and the zoomscale argument for PDF is unnecessary either (you can increase highResolutionMode in the jbrowse config though). Instead, modify the viewportSize inside rasterize.js to something "screen like" such as width: 1200, height: 750

### Export as SVG

You can also convert the PhantomJS PDF to SVG using Inkscape. Simply import the PDF generated by PhantomJS into Inkscape and use "save as..." which by default exports SVG. Alternatively, use the Inkscape command line

`  inkscape  --without-gui --file=input.pdf  --export-plain-svg=output.svg`

On some platforms, you may need to specify the full file paths for input and output files

To begin editing the SVG can be a little daunting as the webpage is a complex object but first steps are probably to run "Object-\>Ungroup" in Inkscape, and then "Edit-\>Deselect" since ungrouping automatically selects everything. The you'll be able to select individual components and edit as needed.

### Using pageres wrapper for PNG output

Using `pageres`, which is a wrapper for PhantomJS, has some commands like --scale to enable easier zoomFactor scaling and -d to increase the timeout.

Install pageres-cli with "npm install -g pageres-cli" and install phantomjs as well. Then you can use arguments

Examples:
```
pageres -d 5 "http://jbrowse.org/code/JBrowse-1.11.6/?data=sample_data/json/volvox&tracklist=0" --filename=jbrowse_scale1 --scale=1 
pageres -d 5 "http://jbrowse.org/code/JBrowse-1.11.6/?data=sample_data/json/volvox&tracklist=0" --filename=jbrowse_scale2 --scale=2
pageres -d 5 http://jbrowse.org/code/JBrowse-1.11.6/?data=sample_data/json/volvox&tracklist=0" --filename=jbrowse_scale4 --scale=4
```
These pageres commands using the --scale argument can upscale content to make high-res images automatically, but using highResolutionMode: 2 or similar is still recommended for canvasfeatures.

### Other links

-   See WormBase.org's blog post about this topic <http://blog.wormbase.org/2016/02/10/creating-hi-res-screenshots-in-jbrowse/>
-   The service <http://phantomjscloud.com> can automate the this screenshot process from the cloud as well, for example by simply providing a jbrowse URL to their service. See <https://phantomjscloud.com/api/browser/v2/a-demo-key-with-low-quota-per-ip-address/?request={url:%22https://jbrowse.org/code/JBrowse-1.11.6/?data=sample_data/json/volvox%26tracks=DNA%2CTranscript%2Cvolvox_microarray_bw_density%2Cvolvox_microarray_bw_xyplot%2Cvolvox-sorted-vcf%2Cvolvox-sorted_bam_coverage%2Cvolvox-sorted_bam%22,renderType:%22png%22,renderSettings:{zoomFactor:2,viewport:{width:3300,height:2000}}}> as an example, this generates the screenshot from jbrowse.org on the fly
-   Plugin for allowing easy screenshots based on phantomjscloud <https://github.com/bhofmei/jbplugin-screenshot>
