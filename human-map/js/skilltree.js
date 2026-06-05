/**
 * HUMAN MAP - SVG Skill Tree v4
 * Hybrid: Sternenkarte + Pfad-Netz (level-based paths)
 * 0deg = top, clockwise. viewBox 0 0 960 960.
 */

const SkillTree = (() => {

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const CX = 480, CY = 480;

    const CLUSTER_R  = 230;
    const DIM_R_HUB  = 130;
    const SYNERGY_R  = 358;
    const R_ARCH     = 68;
    const R_ARCH_REF = 82;
    const R_CLUSTER  = 20;
    const R_DIM      = 24;
    const R_SYN      = 18;
    const DEFAULT_VB = '0 0 960 960';

    const CLUSTER_ZOOM_VB = {
        potenzial: '240 10 480 480',
        kern:      '470 240 480 480',
        antrieb:   '240 470 480 480',
        muster:    '10 240 480 480',
    };

    const PATH_STYLE = {
        1: { width: '0.7', opacity: '0.14' },
        2: { width: '1.0', opacity: '0.24' },
        3: { width: '1.6', opacity: '0.45' },
        4: { width: '2.6', opacity: '0.72' },
        5: { width: '3.2', opacity: '0.90' },
    };

    const CLUSTERS = [
        { id: 'potenzial', label: 'POTENZIAL', angle: 0,   color: '#60a0e8',
          dims: ['mindset_growth','grit_passion','grit_ausdauer','intel_primary','wachstumsfeld'] },
        { id: 'kern',      label: 'KERN',      angle: 90,  color: '#8b7cf8',
          dims: ['offenheit','struktur','energie','verbindung','tiefe'] },
        { id: 'antrieb',   label: 'ANTRIEB',   angle: 180, color: '#f0a855',
          dims: ['werte_freiheit','werte_leistung','werte_innovation','antrieb_type'] },
        { id: 'muster',    label: 'MUSTER',    angle: 270, color: '#f07090',
          dims: ['bindungsstil','loc_internal','stress_typ','rumination'] },
    ];

    const SHORT_LABELS = {
        mindset_growth:'Growth Mindset', grit_passion:'Leidenschaft', grit_ausdauer:'Ausdauer',
        intel_primary:'Intelligenz',     wachstumsfeld:'Wachstumsfeld', offenheit:'Offenheit',
        struktur:'Struktur',             energie:'Soz. Energie',       verbindung:'Verbindung',
        tiefe:'Verarbeitung',            werte_freiheit:'Freiheit',    werte_leistung:'Leistung',
        werte_innovation:'Innovation',   antrieb_type:'Antriebstyp',   bindungsstil:'Bindungsstil',
        loc_internal:'Selbstwirks.',     stress_typ:'Stressmuster',    rumination:'Gruebeln',
    };

    var _zoomedCluster = null;
    var _zoomSvgEl     = null;
    var _resGroup      = null;
    var _resDimId      = null;

    function polar(deg, r) {
        var rad = (deg - 90) * Math.PI / 180;
        return { x: Math.round(CX + r * Math.cos(rad)), y: Math.round(CY + r * Math.sin(rad)) };
    }

    function polarFrom(base, baseDeg, offsetDeg, r) {
        var totalAngle = baseDeg + offsetDeg;
        var rad = (totalAngle - 90) * Math.PI / 180;
        return { x: Math.round(base.x + r * Math.cos(rad)), y: Math.round(base.y + r * Math.sin(rad)) };
    }

    function el(tag, attrs) {
        var e = document.createElementNS(SVG_NS, tag);
        if (attrs) Object.keys(attrs).forEach(function(k) { e.setAttribute(k, String(attrs[k])); });
        return e;
    }

    function seededRandom(seed) {
        var s = seed >>> 0;
        return function() {
            s = ((s * 1664525) + 1013904223) | 0;
            return (s >>> 0) / 0x100000000;
        };
    }

    function hPath(x1, y1, x2, y2) {
        var mx = (x1+x2)/2 + (CX-(x1+x2)/2)*0.18;
        var my = (y1+y2)/2 + (CY-(y1+y2)/2)*0.18;
        return 'M '+x1+' '+y1+' Q '+mx.toFixed(1)+' '+my.toFixed(1)+' '+x2+' '+y2;
    }

    function sPath(sx, sy, dx, dy) {
        var mx=(sx+dx)/2, my=(sy+dy)/2;
        var ax=mx+(mx-CX)*0.12, ay=my+(my-CY)*0.12;
        return 'M '+sx+' '+sy+' Q '+ax.toFixed(1)+' '+ay.toFixed(1)+' '+dx+' '+dy;
    }

    function getLabelPos(nx, ny) {
        var dx=nx-CX, dy=ny-CY, dist=Math.sqrt(dx*dx+dy*dy)||1, off=R_DIM+14;
        var lx=Math.round(nx+(dx/dist)*off), ly=Math.round(ny+(dy/dist)*off);
        var ang=Math.atan2(dy,dx)*180/Math.PI;
        var anchor=(ang>-60&&ang<60)?'start':(ang>120||ang<-120)?'end':'middle';
        return { lx:lx, ly:ly, anchor:anchor };
    }

    function levelColor(level, cc) {
        if (level===1) return 'rgba(255,255,255,0.18)';
        if (level===2) return 'rgba(255,255,255,0.34)';
        if (level===5) return '#f0c840';
        if (level===4) return cc+'e6';
        return cc+'aa';
    }

    function buildNodeMap() {
        var nodeMap={};
        CLUSTERS.forEach(function(cluster) {
            var hub=polar(cluster.angle, CLUSTER_R), n=cluster.dims.length;
            var offsets=n>=5?[-50,-25,0,25,50]:[-45,-15,15,45];
            cluster.dims.forEach(function(dim,i) {
                var pos=polarFrom(hub,cluster.angle,offsets[i],DIM_R_HUB);
                var meta=MODEL.DIMS[dim];
                nodeMap[dim]={
                    x:pos.x, y:pos.y, hx:hub.x, hy:hub.y,
                    cluster:cluster.id, clusterAngle:cluster.angle,
                    clusterColor:cluster.color,
                    color:(meta&&meta.color)?meta.color:cluster.color,
                    label:SHORT_LABELS[dim]||(meta?meta.label:dim),
                    categorical:meta?!!meta.categorical:false,
                };
            });
        });
        return nodeMap;
    }

    function buildDefs(svg, archColor) {
        var defs=el('defs');
        var cg=el('radialGradient',{id:'stCenterGrad',cx:'50%',cy:'40%',r:'60%'});
        cg.appendChild(el('stop',{offset:'0%','stop-color':archColor,'stop-opacity':'0.95'}));
        cg.appendChild(el('stop',{offset:'100%','stop-color':archColor,'stop-opacity':'0.45'}));
        defs.appendChild(cg);
        var ag=el('radialGradient',{id:'stAmbientGrad',cx:'50%',cy:'50%',r:'50%'});
        ag.appendChild(el('stop',{offset:'0%','stop-color':archColor,'stop-opacity':'0.13'}));
        ag.appendChild(el('stop',{offset:'100%','stop-color':archColor,'stop-opacity':'0.00'}));
        defs.appendChild(ag);
        var sg=el('linearGradient',{id:'stSynGrad',x1:'0%',y1:'0%',x2:'100%',y2:'100%'});
        sg.appendChild(el('stop',{offset:'0%','stop-color':'#c9a84c','stop-opacity':'0.95'}));
        sg.appendChild(el('stop',{offset:'100%','stop-color':'#f0dfa3','stop-opacity':'0.90'}));
        defs.appendChild(sg);
        var f=el('filter',{id:'stSynGlow',x:'-60%',y:'-60%',width:'220%',height:'220%'});
        f.appendChild(el('feGaussianBlur',{stdDeviation:'5',result:'blur'}));
        var fm=el('feMerge');
        fm.appendChild(el('feMergeNode',{in:'blur'}));
        fm.appendChild(el('feMergeNode',{in:'SourceGraphic'}));
        f.appendChild(fm); defs.appendChild(f);
        var style=document.createElementNS(SVG_NS,'style');
        style.textContent=[
            '.st-res-g{opacity:0;transition:opacity 0.25s ease;}',
            '.st-res-g.active{opacity:1;}',
            '@media (prefers-reduced-motion:no-preference){',
            '  .st-syn-pulse{animation:stSynPulse 2.2s ease-in-out infinite;}',
            '  .st-syn-dash{animation:stDashFlow 1.8s linear infinite;}',
            '  .st-lv4-pulse{animation:stLv4Pulse 2.5s ease-in-out infinite;}',
            '  @keyframes stSynPulse{0%,100%{opacity:0.15}50%{opacity:0.50}}',
            '  @keyframes stDashFlow{to{stroke-dashoffset:-20}}',
            '  @keyframes stLv4Pulse{0%,100%{opacity:0.06}50%{opacity:0.22}}',
            '}',
        ].join('\n');
        defs.appendChild(style);
        svg.appendChild(defs);
    }

    function buildStarfield(g) {
        var rng=seededRandom(12345);
        for(var i=0;i<82;i++){
            var x=Math.round(rng()*960), y=Math.round(rng()*960);
            var big=rng()>0.8, r=big?0.7:0.4;
            var op=(0.06+rng()*0.08).toFixed(2);
            g.appendChild(el('circle',{cx:x,cy:y,r:r,fill:'#ffffff',opacity:op}));
        }
    }

    function showResonanceLines(svgEl, dimId, nodeMap) {
        hideResonanceLines();
        var resMap=MODEL.RESONANCE_MAP||{}, targets=resMap[dimId]||[];
        if(!targets.length) return;
        var src=nodeMap[dimId]; if(!src) return;
        var g=el('g',{class:'st-res-g'});
        targets.forEach(function(td){
            var tgt=nodeMap[td]; if(!tgt) return;
            g.appendChild(el('path',{d:hPath(src.x,src.y,tgt.x,tgt.y),fill:'none',
                stroke:'rgba(200,200,220,0.35)','stroke-width':'0.8','stroke-dasharray':'3 4'}));
            g.appendChild(el('circle',{cx:tgt.x,cy:tgt.y,r:R_DIM+5,fill:'none',
                stroke:'rgba(200,200,220,0.22)','stroke-width':'1'}));
        });
        var sl=svgEl.querySelector('.st-syn-lines');
        if(sl) svgEl.insertBefore(g,sl); else svgEl.appendChild(g);
        _resGroup=g; _resDimId=dimId;
        requestAnimationFrame(function(){ g.classList.add('active'); });
    }

    function hideResonanceLines() {
        if(_resGroup&&_resGroup.parentNode) _resGroup.parentNode.removeChild(_resGroup);
        _resGroup=null; _resDimId=null;
    }

    function tweenViewBox(svgEl, targetStr, ms) {
        var from=svgEl.getAttribute('viewBox').split(' ').map(Number);
        var to=targetStr.split(' ').map(Number), start=performance.now();
        function ease(t){return 1-Math.pow(1-t,3);}
        function step(now){
            var t=Math.min(1,(now-start)/ms), e=ease(t);
            svgEl.setAttribute('viewBox',from.map(function(f,i){return(f+(to[i]-f)*e).toFixed(1);}).join(' '));
            if(t<1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    function zoomToCluster(svgEl, clusterId) {
        _zoomedCluster=clusterId; _zoomSvgEl=svgEl;
        tweenViewBox(svgEl,CLUSTER_ZOOM_VB[clusterId],480);
        svgEl.querySelectorAll('[data-cluster]').forEach(function(e){
            e.style.transition='opacity 0.35s ease';
            e.style.opacity=(e.getAttribute('data-cluster')===clusterId)?'1':'0.08';
        });
        svgEl.querySelectorAll('.st-center,.st-syn-nodes,.st-syn-lines').forEach(function(g){
            g.style.transition='opacity 0.35s ease'; g.style.opacity='0.2';
        });
        var btn=document.getElementById('hm-tree-back-btn');
        if(btn) btn.classList.add('visible');
    }

    function resetZoom() {
        if(!_zoomSvgEl) return;
        tweenViewBox(_zoomSvgEl,DEFAULT_VB,480);
        _zoomSvgEl.querySelectorAll('[data-cluster]').forEach(function(e){e.style.opacity='';});
        _zoomSvgEl.querySelectorAll('.st-center,.st-syn-nodes,.st-syn-lines').forEach(function(g){g.style.opacity='';});
        _zoomedCluster=null; hideResonanceLines();
        var btn=document.getElementById('hm-tree-back-btn');
        if(btn) btn.classList.remove('visible');
    }

    function ensureTooltip() {
        var tt=document.getElementById('hm-node-tooltip');
        if(!tt){tt=document.createElement('div');tt.id='hm-node-tooltip';tt.className='hm-node-tooltip';document.body.appendChild(tt);}
        return tt;
    }

    function attachTooltip(nodeEl, tt, data) {
        nodeEl.addEventListener('mouseenter',function(e){
            var ls=data.categorical?(data.catValue||'--'):('Lv '+data.level+' \u00b7 '+data.levelLabel);
            var sh=(!data.categorical&&data.score!==null)?'<div class="hm-ntt__score">'+data.score+'<span> / 100</span></div>':'';
            tt.innerHTML='<div class="hm-ntt__header"><span class="hm-ntt__name">'+data.label+'</span><span class="hm-ntt__level" style="background:'+data.lc+'22;color:'+data.lc+';border-color:'+data.lc+'55">'+ls+'</span></div>'+sh;
            tt.style.borderColor=data.lc;
            tt.style.left=(e.clientX+16)+'px'; tt.style.top=Math.max(e.clientY-10,6)+'px';
            tt.classList.add('is-visible');
        });
        nodeEl.addEventListener('mousemove',function(e){tt.style.left=(e.clientX+16)+'px';tt.style.top=Math.max(e.clientY-10,6)+'px';});
        nodeEl.addEventListener('mouseleave',function(){tt.classList.remove('is-visible');});
    }

    function buildTree(svgEl, results) {
        var arch=results.archetype.primary, scores=results.scores, categorical=results.categorical||{};
        var activeSynIds={}; (results.synergies||[]).forEach(function(id){activeSynIds[id]=true;});
        var nodeMap=buildNodeMap(), synCount=MODEL.SYNERGIES.length;

        while(svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
        buildDefs(svgEl,arch.color);

        var gStars=el('g',{class:'st-stars'}),    gAmbient=el('g',{class:'st-ambient'}),
            gRings=el('g',{class:'st-rings'}),     gLines=el('g',{class:'st-lines'}),
            gSynLines=el('g',{class:'st-syn-lines'}), gClusters=el('g',{class:'st-clusters'}),
            gDims=el('g',{class:'st-dims'}),        gLabels=el('g',{class:'st-labels','pointer-events':'none'}),
            gSynNodes=el('g',{class:'st-syn-nodes'}), gCenter=el('g',{class:'st-center'});
        [gStars,gAmbient,gRings,gLines,gSynLines,gClusters,gDims,gLabels,gSynNodes,gCenter]
            .forEach(function(g){svgEl.appendChild(g);});

        // 1. Starfield
        buildStarfield(gStars);

        // 2. Ambient center glow
        gAmbient.appendChild(el('circle',{cx:CX,cy:CY,r:190,fill:'url(#stAmbientGrad)'}));

        // 3. Background rings
        [{r:358,dash:'4 8',op:'0.12'},{r:230,dash:null,op:'0.09'},{r:130,dash:null,op:'0.06'}]
            .forEach(function(cfg){
                var c=el('circle',{cx:CX,cy:CY,r:cfg.r,fill:'none',stroke:'#303040','stroke-width':'0.75',opacity:cfg.op});
                if(cfg.dash) c.setAttribute('stroke-dasharray',cfg.dash);
                gRings.appendChild(c);
            });

        // 4. Center -> cluster paths
        CLUSTERS.forEach(function(cluster){
            var hub=polar(cluster.angle,CLUSTER_R);
            gLines.appendChild(el('path',{d:hPath(CX,CY,hub.x,hub.y),fill:'none',
                stroke:cluster.color,'stroke-width':'1.5',opacity:'0.30','data-cluster':cluster.id}));
        });

        // 5. Hub -> dim paths (level-based)
        Object.keys(nodeMap).forEach(function(dim){
            var n=nodeMap[dim];
            var score=n.categorical?null:(scores[dim]!==undefined?scores[dim]:50);
            var level=n.categorical?3:Scoring.scoreToLevel(score);
            var ps=PATH_STYLE[level]||PATH_STYLE[3];
            gLines.appendChild(el('path',{d:hPath(n.hx,n.hy,n.x,n.y),fill:'none',
                stroke:n.clusterColor,'stroke-width':ps.width,opacity:ps.opacity,'data-cluster':n.cluster}));
        });

        // 6. Synergy connection lines (active only, gold animated)
        MODEL.SYNERGIES.forEach(function(syn,idx){
            if(!activeSynIds[syn.id]||!syn.connects) return;
            var gapCentres=[45,135,225,315];
            var base=Math.floor(synCount/4), extras=synCount%4, counted=0, angle=45;
            for(var g=0;g<4;g++){
                var cnt=base+(g<extras?1:0);
                if(idx<counted+cnt){ var pos=idx-counted; angle=gapCentres[g]+(cnt>1?(pos/(cnt-1)-0.5)*28:0); break; }
                counted+=cnt;
            }
            var sp=polar(angle,SYNERGY_R);
            syn.connects.forEach(function(dimId){
                var dn=nodeMap[dimId]; if(!dn) return;
                gSynLines.appendChild(el('path',{d:sPath(sp.x,sp.y,dn.x,dn.y),fill:'none',
                    stroke:'url(#stSynGrad)','stroke-width':'1.1','stroke-dasharray':'5 4',
                    class:'st-syn-dash',opacity:'0.55'}));
            });
        });

        // 7. Cluster hubs — label placed OUTSIDE the circle along the arm direction
        CLUSTERS.forEach(function(cluster){
            var hub=polar(cluster.angle,CLUSTER_R);
            var g=el('g',{class:'st-cluster-hub',style:'cursor:pointer','data-cluster':cluster.id});
            g.appendChild(el('circle',{cx:hub.x,cy:hub.y,r:R_CLUSTER+20,fill:'transparent',stroke:'none'}));
            g.appendChild(el('circle',{cx:hub.x,cy:hub.y,r:R_CLUSTER,fill:cluster.color,'fill-opacity':'0.10',
                stroke:cluster.color,'stroke-width':'1.5','stroke-opacity':'0.45'}));

            // Place label radially outward from hub (away from center)
            var ldx=hub.x-CX, ldy=hub.y-CY;
            var ldist=Math.sqrt(ldx*ldx+ldy*ldy)||1;
            var lx=Math.round(hub.x+(ldx/ldist)*(R_CLUSTER+14));
            var ly=Math.round(hub.y+(ldy/ldist)*(R_CLUSTER+14));
            var lang=Math.atan2(ldy,ldx)*180/Math.PI;
            var lanchor=(lang>-60&&lang<60)?'start':(lang>120||lang<-120)?'end':'middle';
            var lbaseline=(ldy<-0.1)?'auto':(ldy>0.1)?'hanging':'middle';

            var t=el('text',{x:lx,y:ly,'text-anchor':lanchor,'dominant-baseline':lbaseline,
                'font-size':'9','font-family':'Inter, sans-serif','font-weight':'700','letter-spacing':'0.08em',
                fill:cluster.color,opacity:'0.85','pointer-events':'none'});
            t.textContent=cluster.label; g.appendChild(t);
            g.addEventListener('click',function(e){e.stopPropagation();hideResonanceLines();zoomToCluster(svgEl,cluster.id);});
            gClusters.appendChild(g);
        });

        // 8. Dimension nodes
        var tt=ensureTooltip();
        Object.keys(nodeMap).forEach(function(dim,idx){
            var n=nodeMap[dim], score=null, level=3, catValue=null;
            if(n.categorical){ catValue=categorical[dim]||'--'; }
            else{ score=scores[dim]!==undefined?scores[dim]:50; level=Scoring.scoreToLevel(score); }
            var lc=levelColor(level,n.clusterColor);
            var nodeG=el('g',{class:'st-dim-node',style:'cursor:pointer','data-cluster':n.cluster,'data-dim':dim});

            if(level===5) nodeG.appendChild(el('circle',{cx:n.x,cy:n.y,r:R_DIM+7,fill:'none',stroke:'#f0c840','stroke-width':'1','stroke-opacity':'0.18'}));
            if(level===4) nodeG.appendChild(el('circle',{cx:n.x,cy:n.y,r:R_DIM+9,fill:n.clusterColor,'fill-opacity':'0.06',stroke:n.clusterColor,'stroke-width':'0.5','stroke-opacity':'0.15',class:'st-lv4-pulse'}));
            nodeG.appendChild(el('circle',{cx:n.x,cy:n.y,r:R_DIM,fill:n.clusterColor,'fill-opacity':'0.08'}));
            nodeG.appendChild(el('circle',{cx:n.x,cy:n.y,r:R_DIM,fill:'none',stroke:lc,'stroke-width':level>=4?'2.2':'1.8'}));

            var inner=el('text',{x:n.x,y:n.y,'text-anchor':'middle','dominant-baseline':'middle',
                'font-size':n.categorical?'9':'11','font-family':'Inter, sans-serif','font-weight':'700',
                fill:'#ffffff',opacity:'0.92','pointer-events':'none'});
            inner.textContent=n.categorical?(catValue||'--').slice(0,2).toUpperCase():String(level);
            nodeG.appendChild(inner);

            attachTooltip(nodeG,tt,{label:n.label,score:score,level:level,levelLabel:Scoring.levelLabel(level),categorical:n.categorical,catValue:catValue,lc:lc});

            nodeG.addEventListener('click',function(e){
                e.stopPropagation();
                if(_resDimId===dim) hideResonanceLines(); else showResonanceLines(svgEl,dim,nodeMap);
                svgEl.dispatchEvent(new CustomEvent('hm:nodeclick',{bubbles:true,detail:{
                    dim:dim,label:n.label,score:score,level:level,levelLabel:Scoring.levelLabel(level),
                    categorical:n.categorical,catValue:catValue,color:n.color,clientY:e.clientY}}));
            });
            gDims.appendChild(nodeG);

            // Staggered fade-in
            nodeG.style.opacity='0'; nodeG.style.transition='opacity 0.5s '+(380+idx*55)+'ms ease';
            setTimeout(function(){nodeG.style.opacity='1';},60);

            // Label
            var lp=getLabelPos(n.x,n.y);
            var lbl=el('text',{x:lp.lx,y:lp.ly,'text-anchor':lp.anchor,'dominant-baseline':'middle',
                'font-size':'11.5','font-family':'Inter, sans-serif','font-weight':'500',
                fill:'#cac0b8',opacity:'0.85','data-cluster':n.cluster});
            lbl.textContent=n.label; gLabels.appendChild(lbl);
        });

        // 9. Synergy nodes — placed in 4 diagonal gaps between cluster arms
        // Cluster arms at 0°,90°,180°,270° → gap centres at 45°,135°,225°,315°
        function synergyAngle(i, total){
            var gapCentres=[45,135,225,315];
            var base=Math.floor(total/4), extras=total%4, counted=0;
            for(var g=0;g<4;g++){
                var cnt=base+(g<extras?1:0);
                if(i<counted+cnt){
                    var pos=i-counted;
                    var spread=cnt>1?(pos/(cnt-1)-0.5)*28:0;
                    return gapCentres[g]+spread;
                }
                counted+=cnt;
            }
            return 45;
        }
        MODEL.SYNERGIES.forEach(function(syn,idx){
            var sp=polar(synergyAngle(idx,synCount),SYNERGY_R), isActive=!!activeSynIds[syn.id];
            var g=el('g',{class:isActive?'st-syn-node st-syn-node--active':'st-syn-node st-syn-node--locked',style:'cursor:pointer'});
            if(isActive){
                g.appendChild(el('circle',{cx:sp.x,cy:sp.y,r:R_SYN+10,fill:'none',stroke:'#c9a84c','stroke-width':'1.5','stroke-opacity':'0.35',class:'st-syn-pulse'}));
                g.appendChild(el('circle',{cx:sp.x,cy:sp.y,r:R_SYN,fill:'#c9a84c','fill-opacity':'0.88',stroke:'#f0dfa3','stroke-width':'2',filter:'url(#stSynGlow)'}));
                var star=el('text',{x:sp.x,y:sp.y,'text-anchor':'middle','dominant-baseline':'middle','font-size':'12',fill:'#1a1200','font-weight':'700','pointer-events':'none'});
                star.textContent='\u2746'; g.appendChild(star);
                var sdx=sp.x-CX,sdy=sp.y-CY,sdist=Math.sqrt(sdx*sdx+sdy*sdy)||1;
                var slx=Math.round(sp.x+(sdx/sdist)*(R_SYN+13)), sly=Math.round(sp.y+(sdy/sdist)*(R_SYN+13));
                var sang=Math.atan2(sdy,sdx)*180/Math.PI;
                var sanch=(sang>-60&&sang<60)?'start':(sang>120||sang<-120)?'end':'middle';
                var snL=el('text',{x:slx,y:sly,'text-anchor':sanch,'dominant-baseline':'middle',
                    'font-size':'10','font-family':'Inter, sans-serif','font-weight':'500',fill:'#c9a84c',opacity:'0.90','pointer-events':'none'});
                snL.textContent=syn.name; g.appendChild(snL);
            } else {
                g.appendChild(el('circle',{cx:sp.x,cy:sp.y,r:R_SYN,fill:'#0d0d0d',stroke:'rgba(255,255,255,0.08)','stroke-width':'1.5','stroke-dasharray':'4 3'}));
                var qm=el('text',{x:sp.x,y:sp.y,'text-anchor':'middle','dominant-baseline':'middle','font-size':'11',fill:'#3a3a3a',opacity:'0.9','pointer-events':'none'});
                qm.textContent='?'; g.appendChild(qm);
            }
            g.addEventListener('click',function(e){
                e.stopPropagation(); hideResonanceLines();
                svgEl.dispatchEvent(new CustomEvent('hm:synergyclick',{bubbles:true,detail:{syn:syn,isActive:isActive,scores:scores,categorical:categorical,clientY:e.clientY}}));
            });
            gSynNodes.appendChild(g);
        });

        // 10. Center archetype node
        gCenter.appendChild(el('circle',{cx:CX,cy:CY,r:R_ARCH_REF,fill:'none',stroke:arch.color,'stroke-width':'1','stroke-opacity':'0.28'}));
        gCenter.appendChild(el('circle',{cx:CX,cy:CY,r:R_ARCH,fill:'url(#stCenterGrad)','fill-opacity':'0.90',stroke:arch.color,'stroke-width':'1.8','stroke-opacity':'0.95'}));
        var et=el('text',{x:CX,y:CY-16,'text-anchor':'middle','dominant-baseline':'middle','font-size':'26','pointer-events':'none'});
        et.textContent=arch.emoji||'\u25cf'; gCenter.appendChild(et);
        var sn=arch.name.replace(/^(Der|Die|Das)\s+/,'');
        sn.split(' ').forEach(function(part,i){
            var pt=el('text',{x:CX,y:CY+10+i*15,'text-anchor':'middle','dominant-baseline':'hanging',
                'font-size':'11.5','font-family':'Inter, sans-serif','font-weight':'700',fill:'#ffffff',opacity:'0.95','pointer-events':'none'});
            pt.textContent=part; gCenter.appendChild(pt);
        });

        // Click empty area -> hide resonance
        svgEl.addEventListener('click',function(){hideResonanceLines();});

        // Reveal animation (sequential layer fade-in)
        [gStars,gAmbient,gRings,gLines,gSynLines,gCenter,gSynNodes].forEach(function(g){
            g.style.opacity='0'; g.style.transition='opacity 0.7s ease';
        });
        setTimeout(function(){gStars.style.opacity='1';},50);
        setTimeout(function(){gAmbient.style.opacity='1';gRings.style.opacity='1';},200);
        setTimeout(function(){gLines.style.opacity='1';},500);
        setTimeout(function(){gCenter.style.opacity='1';},750);
        setTimeout(function(){
            gClusters.querySelectorAll('.st-cluster-hub').forEach(function(hub,i){
                hub.style.opacity='0'; hub.style.transition='opacity 0.5s '+(i*130)+'ms ease';
                setTimeout(function(){hub.style.opacity='1';},20);
            });
        },1000);
        setTimeout(function(){gSynLines.style.opacity='1';gSynNodes.style.opacity='1';},1900);
    }

    return { buildTree, resetZoom };

})();
