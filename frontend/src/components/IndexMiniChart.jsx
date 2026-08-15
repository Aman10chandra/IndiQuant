import { useEffect, useRef, useState } from 'react';
import { getHistory } from '../lib/api';
import { useMarketStatus } from '../lib/marketStatus';

export const REAL_NIFTY_1Y_SERIES = [{"date": "2025-08-14", "open": 24607.25, "high": 24673.65, "low": 24596.9, "close": 24631.3, "volume": 270200}, {"date": "2025-08-21", "open": 25142.0, "high": 25153.65, "low": 25054.9, "close": 25083.75, "volume": 226500}, {"date": "2025-08-28", "open": 24695.8, "high": 24702.65, "low": 24481.6, "close": 24500.9, "volume": 326600}, {"date": "2025-09-03", "open": 24616.5, "high": 24737.05, "low": 24533.2, "close": 24715.05, "volume": 340300}, {"date": "2025-09-09", "open": 24864.1, "high": 24891.8, "low": 24814.0, "close": 24868.6, "volume": 226900}, {"date": "2025-09-15", "open": 25118.9, "high": 25138.45, "low": 25048.75, "close": 25069.2, "volume": 185400}, {"date": "2025-09-19", "open": 25410.2, "high": 25428.75, "low": 25286.3, "close": 25327.05, "volume": 380400}, {"date": "2025-09-25", "open": 25034.5, "high": 25092.7, "low": 24878.3, "close": 24890.85, "volume": 342500}, {"date": "2025-10-01", "open": 24620.55, "high": 24867.95, "low": 24605.95, "close": 24836.3, "volume": 308900}, {"date": "2025-10-08", "open": 25079.75, "high": 25192.5, "low": 25008.5, "close": 25046.15, "volume": 227400}, {"date": "2025-10-14", "open": 25277.55, "high": 25310.35, "low": 25060.55, "close": 25145.5, "volume": 292100}, {"date": "2025-10-20", "open": 25824.6, "high": 25926.2, "low": 25788.5, "close": 25843.15, "volume": 301100}, {"date": "2025-10-27", "open": 25843.2, "high": 26005.95, "low": 25827.0, "close": 25966.05, "volume": 266300}, {"date": "2025-10-31", "open": 25863.8, "high": 25953.75, "low": 25711.2, "close": 25722.1, "volume": 334400}, {"date": "2025-11-07", "open": 25433.8, "high": 25551.25, "low": 25318.45, "close": 25492.3, "volume": 305600}, {"date": "2025-11-13", "open": 25906.1, "high": 26010.7, "low": 25808.4, "close": 25879.15, "volume": 385200}, {"date": "2025-11-19", "open": 25918.1, "high": 26074.65, "low": 25856.2, "close": 26052.65, "volume": 250100}, {"date": "2025-11-25", "open": 25998.5, "high": 26032.6, "low": 25857.5, "close": 25884.8, "volume": 260500}, {"date": "2025-12-01", "open": 26325.8, "high": 26325.8, "low": 26124.2, "close": 26175.75, "volume": 213800}, {"date": "2025-12-05", "open": 25999.8, "high": 26202.6, "low": 25985.35, "close": 26186.45, "volume": 249300}, {"date": "2025-12-11", "open": 25771.4, "high": 25922.8, "low": 25693.25, "close": 25898.55, "volume": 206100}, {"date": "2025-12-17", "open": 25902.4, "high": 25929.15, "low": 25770.35, "close": 25818.55, "volume": 206500}, {"date": "2025-12-23", "open": 26205.2, "high": 26233.55, "low": 26119.05, "close": 26177.15, "volume": 216600}, {"date": "2025-12-30", "open": 25940.9, "high": 25976.75, "low": 25878.0, "close": 25938.85, "volume": 396900}, {"date": "2026-01-05", "open": 26333.7, "high": 26373.2, "low": 26210.05, "close": 26250.3, "volume": 338800}, {"date": "2026-01-09", "open": 25840.4, "high": 25940.6, "low": 25623.0, "close": 25683.3, "volume": 348800}, {"date": "2026-01-16", "open": 25696.05, "high": 25873.5, "low": 25662.4, "close": 25694.35, "volume": 434000}, {"date": "2026-01-22", "open": 25344.15, "high": 25435.75, "low": 25168.5, "close": 25289.9, "volume": 486400}, {"date": "2026-01-29", "open": 25345.0, "high": 25458.15, "low": 25159.8, "close": 25418.9, "volume": 582400}, {"date": "2026-02-04", "open": 25675.05, "high": 25818.55, "low": 25563.95, "close": 25776.0, "volume": 429800}, {"date": "2026-02-10", "open": 25922.65, "high": 25989.45, "low": 25870.45, "close": 25935.15, "volume": 460900}, {"date": "2026-02-16", "open": 25423.6, "high": 25697.0, "low": 25372.7, "close": 25682.75, "volume": 275800}, {"date": "2026-02-20", "open": 25406.55, "high": 25663.55, "low": 25379.75, "close": 25571.25, "volume": 296600}, {"date": "2026-02-26", "open": 25556.3, "high": 25572.95, "low": 25400.95, "close": 25496.55, "volume": 405200}, {"date": "2026-03-05", "open": 24615.95, "high": 24854.2, "low": 24529.4, "close": 24765.9, "volume": 504300}, {"date": "2026-03-11", "open": 24231.85, "high": 24299.0, "low": 23834.3, "close": 23866.85, "volume": 407400}, {"date": "2026-03-17", "open": 23493.2, "high": 23656.8, "low": 23346.6, "close": 23581.15, "volume": 458800}, {"date": "2026-03-23", "open": 22824.35, "high": 22851.7, "low": 22471.25, "close": 22512.65, "volume": 550300}, {"date": "2026-03-30", "open": 22549.65, "high": 22714.1, "low": 22283.85, "close": 22331.4, "volume": 698600}, {"date": "2026-04-07", "open": 22838.7, "high": 23153.85, "low": 22719.3, "close": 23123.65, "volume": 477000}, {"date": "2026-04-13", "open": 23589.6, "high": 23907.4, "low": 23555.6, "close": 23842.65, "volume": 488800}, {"date": "2026-04-20", "open": 24391.5, "high": 24480.65, "low": 24241.25, "close": 24364.85, "volume": 415900}, {"date": "2026-04-24", "open": 24100.55, "high": 24206.0, "low": 23813.65, "close": 23897.95, "volume": 438400}, {"date": "2026-04-30", "open": 23996.95, "high": 24087.45, "low": 23796.85, "close": 23997.55, "volume": 505500}, {"date": "2026-05-07", "open": 24398.5, "high": 24482.1, "low": 24284.0, "close": 24326.65, "volume": 440600}, {"date": "2026-05-13", "open": 23362.45, "high": 23582.95, "low": 23262.55, "close": 23412.6, "volume": 415400}, {"date": "2026-05-19", "open": 23675.3, "high": 23782.3, "low": 23587.2, "close": 23618.0, "volume": 442000}, {"date": "2026-05-25", "open": 23940.25, "high": 24054.45, "low": 23922.85, "close": 24031.7, "volume": 351200}, {"date": "2026-06-01", "open": 23654.5, "high": 23733.7, "low": 23357.95, "close": 23382.6, "volume": 421700}, {"date": "2026-06-05", "open": 23478.95, "high": 23516.35, "low": 23282.65, "close": 23366.7, "volume": 366200}, {"date": "2026-06-11", "open": 23104.4, "high": 23327.45, "low": 23072.05, "close": 23161.6, "volume": 363000}, {"date": "2026-06-17", "open": 24044.5, "high": 24108.2, "low": 23969.7, "close": 24085.7, "volume": 352700}, {"date": "2026-06-23", "open": 24071.3, "high": 24135.5, "low": 23784.95, "close": 23824.1, "volume": 340100}, {"date": "2026-06-30", "open": 24032.05, "high": 24035.55, "low": 23829.2, "close": 23865.75, "volume": 449000}, {"date": "2026-07-06", "open": 24306.85, "high": 24458.65, "low": 24287.1, "close": 24430.35, "volume": 329400}, {"date": "2026-07-10", "open": 24124.7, "high": 24228.45, "low": 24120.35, "close": 24206.9, "volume": 313100}, {"date": "2026-07-16", "open": 24142.1, "high": 24186.5, "low": 24050.0, "close": 24072.75, "volume": 264300}, {"date": "2026-07-22", "open": 24150.45, "high": 24166.3, "low": 23961.4, "close": 23996.25, "volume": 304700}, {"date": "2026-07-28", "open": 23971.25, "high": 24041.15, "low": 23954.6, "close": 23985.35, "volume": 437800}, {"date": "2026-08-03", "open": 24572.7, "high": 24774.3, "low": 24515.15, "close": 24774.3, "volume": 342300}, {"date": "2026-08-07", "open": 24538.9, "high": 24630.4, "low": 24522.75, "close": 24570.65, "volume": 254800}, {"date": "2026-08-13", "open": 24431.6, "high": 24431.6, "low": 24311.4, "close": 24395.85, "volume": 295800}, {"date": "2026-08-14", "open": 24361.9, "high": 24405.2, "low": 24296.8, "close": 24366.0, "volume": 267700}];

export const REAL_SENSEX_1Y_SERIES = [{"date": "2025-08-14", "open": 80625.28, "high": 80751.18, "low": 80489.86, "close": 80597.66, "volume": 7200}, {"date": "2025-08-21", "open": 82220.46, "high": 82231.17, "low": 81921.22, "close": 82000.71, "volume": 10100}, {"date": "2025-08-28", "open": 80754.66, "high": 80775.71, "low": 80013.02, "close": 80080.57, "volume": 7800}, {"date": "2025-09-03", "open": 80295.99, "high": 80671.28, "low": 80004.6, "close": 80567.71, "volume": 17100}, {"date": "2025-09-09", "open": 81129.69, "high": 81181.37, "low": 80927.97, "close": 81101.32, "volume": 6300}, {"date": "2025-09-15", "open": 81925.51, "high": 81998.51, "low": 81744.7, "close": 81785.74, "volume": 10500}, {"date": "2025-09-19", "open": 82946.04, "high": 82978.63, "low": 82485.92, "close": 82626.23, "volume": 9700}, {"date": "2025-09-25", "open": 81574.31, "high": 81840.73, "low": 81092.89, "close": 81159.68, "volume": 14800}, {"date": "2025-10-01", "open": 80173.24, "high": 81068.43, "low": 80159.9, "close": 80983.31, "volume": 22300}, {"date": "2025-10-08", "open": 81899.51, "high": 82257.74, "low": 81646.08, "close": 81773.66, "volume": 15200}, {"date": "2025-10-14", "open": 82404.54, "high": 82573.37, "low": 81781.62, "close": 82029.98, "volume": 12600}, {"date": "2025-10-20", "open": 84269.3, "high": 84656.56, "low": 84196.79, "close": 84363.37, "volume": 10900}, {"date": "2025-10-27", "open": 84297.39, "high": 84932.08, "low": 84294.2, "close": 84778.84, "volume": 12000}, {"date": "2025-10-31", "open": 84379.79, "high": 84712.79, "low": 83905.66, "close": 83938.71, "volume": 13300}, {"date": "2025-11-07", "open": 83150.15, "high": 83390.11, "low": 82670.95, "close": 83216.28, "volume": 15900}, {"date": "2025-11-13", "open": 84525.89, "high": 84919.43, "low": 84253.05, "close": 84478.67, "volume": 25600}, {"date": "2025-11-19", "open": 84643.78, "high": 85236.77, "low": 84525.98, "close": 85186.47, "volume": 8900}, {"date": "2025-11-25", "open": 85008.93, "high": 85110.24, "low": 84536.73, "close": 84587.01, "volume": 6200}, {"date": "2025-12-01", "open": 86065.92, "high": 86159.02, "low": 85489.65, "close": 85641.9, "volume": 8500}, {"date": "2025-12-05", "open": 85125.48, "high": 85796.72, "low": 85078.12, "close": 85712.37, "volume": 7900}, {"date": "2025-12-11", "open": 84456.75, "high": 84906.93, "low": 84150.19, "close": 84818.13, "volume": 15800}, {"date": "2025-12-17", "open": 84856.26, "high": 84889.45, "low": 84415.98, "close": 84559.65, "volume": 11200}, {"date": "2025-12-23", "open": 85690.1, "high": 85704.93, "low": 85342.99, "close": 85524.84, "volume": 6100}, {"date": "2025-12-30", "open": 84600.99, "high": 84806.99, "low": 84470.94, "close": 84675.08, "volume": 6900}, {"date": "2026-01-05", "open": 85640.05, "high": 85883.5, "low": 85315.33, "close": 85439.62, "volume": 12600}, {"date": "2026-01-09", "open": 84022.09, "high": 84406.22, "low": 83402.28, "close": 83576.24, "volume": 12500}, {"date": "2026-01-16", "open": 83670.79, "high": 84134.97, "low": 83456.5, "close": 83570.35, "volume": 22800}, {"date": "2026-01-22", "open": 82459.66, "high": 82783.18, "low": 81874.39, "close": 82307.37, "volume": 26500}, {"date": "2026-01-29", "open": 82368.96, "high": 82689.96, "low": 81707.94, "close": 82566.37, "volume": 23500}, {"date": "2026-02-04", "open": 83252.06, "high": 83947.53, "low": 83119.95, "close": 83817.69, "volume": 19900}, {"date": "2026-02-10", "open": 84210.0, "high": 84482.95, "low": 84063.47, "close": 84273.92, "volume": 45500}, {"date": "2026-02-16", "open": 82480.4, "high": 83333.49, "low": 82276.95, "close": 83277.15, "volume": 33800}, {"date": "2026-02-20", "open": 82272.49, "high": 83132.08, "low": 82206.21, "close": 82814.71, "volume": 19600}, {"date": "2026-02-26", "open": 82418.78, "high": 82579.16, "low": 81970.47, "close": 82248.61, "volume": 122500}, {"date": "2026-03-05", "open": 79530.48, "high": 80303.83, "low": 79201.69, "close": 80015.9, "volume": 22200}, {"date": "2026-03-11", "open": 78238.91, "high": 78324.37, "low": 76759.26, "close": 76863.71, "volume": 16400}, {"date": "2026-03-17", "open": 75826.68, "high": 76304.26, "low": 75324.73, "close": 76070.84, "volume": 35200}, {"date": "2026-03-23", "open": 73732.58, "high": 73732.58, "low": 72558.44, "close": 72696.39, "volume": 19300}, {"date": "2026-03-30", "open": 72565.22, "high": 73165.32, "low": 71774.13, "close": 71947.55, "volume": 26600}, {"date": "2026-04-07", "open": 73734.36, "high": 74686.32, "low": 73282.41, "close": 74616.58, "volume": 13400}, {"date": "2026-04-13", "open": 75937.16, "high": 77063.41, "low": 75868.32, "close": 76847.57, "volume": 19300}, {"date": "2026-04-20", "open": 78632.9, "high": 78942.45, "low": 78203.3, "close": 78520.3, "volume": 13200}, {"date": "2026-04-24", "open": 77483.8, "high": 77710.82, "low": 76403.87, "close": 76664.21, "volume": 14100}, {"date": "2026-04-30", "open": 77014.21, "high": 77254.33, "low": 76258.86, "close": 76913.5, "volume": 27900}, {"date": "2026-05-07", "open": 78339.24, "high": 78384.7, "low": 77713.21, "close": 77844.52, "volume": 21500}, {"date": "2026-05-13", "open": 74439.34, "high": 75191.57, "low": 74134.48, "close": 74608.98, "volume": 18200}, {"date": "2026-05-19", "open": 75441.27, "high": 75746.27, "low": 75115.99, "close": 75200.85, "volume": 13100}, {"date": "2026-05-25", "open": 76135.82, "high": 76559.07, "low": 76097.02, "close": 76488.96, "volume": 11600}, {"date": "2026-06-01", "open": 75203.02, "high": 75367.93, "low": 74203.68, "close": 74267.34, "volume": 13500}, {"date": "2026-06-05", "open": 74629.94, "high": 74717.57, "low": 73988.75, "close": 74243.34, "volume": 18000}, {"date": "2026-06-11", "open": 73615.99, "high": 74394.34, "low": 73518.75, "close": 73832.55, "volume": 27500}, {"date": "2026-06-17", "open": 77080.09, "high": 77218.99, "low": 76768.49, "close": 77155.62, "volume": 17800}, {"date": "2026-06-23", "open": 77086.05, "high": 77194.83, "low": 76082.51, "close": 76200.68, "volume": 12200}, {"date": "2026-06-30", "open": 77005.51, "high": 77037.36, "low": 76329.39, "close": 76478.67, "volume": 23400}, {"date": "2026-07-06", "open": 77940.9, "high": 78398.06, "low": 77879.7, "close": 78285.07, "volume": 23600}, {"date": "2026-07-10", "open": 77395.63, "high": 77642.23, "low": 77320.56, "close": 77569.39, "volume": 12300}, {"date": "2026-07-16", "open": 77388.42, "high": 77579.69, "low": 77086.42, "close": 77186.87, "volume": 25600}, {"date": "2026-07-22", "open": 77384.95, "high": 77384.95, "low": 76641.19, "close": 76755.05, "volume": 13200}, {"date": "2026-07-28", "open": 76831.75, "high": 76988.48, "low": 76672.77, "close": 76765.92, "volume": 18700}, {"date": "2026-08-03", "open": 78883.34, "high": 78895.1, "low": 78497.34, "close": 78639.03, "volume": 21000}, {"date": "2026-08-07", "open": 78516.08, "high": 78757.4, "low": 78377.07, "close": 78499.17, "volume": 13900}, {"date": "2026-08-13", "open": 78111.91, "high": 78119.39, "low": 77665.89, "close": 78079.96, "volume": 26900}, {"date": "2026-08-14", "open": 77903.43, "high": 78048.91, "low": 77684.37, "close": 78009.25, "volume": 13700}];

export default function IndexMiniChart({
  symbol,
  name,
  exchange,
  price,
  change,
  changePct,
  defaultPeriod = '1mo'
}) {
  const marketStatus = useMarketStatus();
  const [period, setPeriod] = useState(defaultPeriod);
  const isSensex = symbol.includes('BSESN') || symbol.includes('SENSEX');
  const [data, setData] = useState(() => {
    if (defaultPeriod === '1y') {
      return isSensex ? REAL_SENSEX_1Y_SERIES : REAL_NIFTY_1Y_SERIES;
    }
    return isSensex ? REAL_SENSEX_SERIES : REAL_NIFTY_SERIES;
  });
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 340, height: 130 });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Immediately set appropriate baseline series
    if (period === '1y') {
      setData(isSensex ? REAL_SENSEX_1Y_SERIES : REAL_NIFTY_1Y_SERIES);
    } else if (period === '1mo') {
      setData(isSensex ? REAL_SENSEX_SERIES : REAL_NIFTY_SERIES);
    }

    getHistory(symbol, period)
      .then(res => {
        if (isMounted && res?.data?.length) {
          setData(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [symbol, period, isSensex]);


  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: 130 });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height: h } = dimensions;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const padding = { top: 12, right: 12, bottom: 20, left: 12 };
    const plotW = Math.max(10, width - padding.left - padding.right);
    const plotH = Math.max(10, h - padding.top - padding.bottom);

    const closes = data.map(d => d.close);
    const minPrice = Math.min(...closes) * 0.998;
    const maxPrice = Math.max(...closes) * 1.002;
    const range = maxPrice - minPrice || 1;

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const isUp = closes[closes.length - 1] >= closes[0];
    const lineColor = isUp ? '#10b981' : '#ef4444';
    const gradientColor = isUp
      ? (isDarkMode ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)')
      : (isDarkMode ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.12)');

    const xScale = (i) => padding.left + (i / (data.length - 1)) * plotW;
    const yScale = (val) => padding.top + ((maxPrice - val) / range) * plotH;

    ctx.clearRect(0, 0, width, h);

    // Subtle background grid
    ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = padding.top + (i / 4) * plotH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotW, y);
      ctx.stroke();
    }

    // Gradient Fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + plotH);
    gradient.addColorStop(0, gradientColor);
    gradient.addColorStop(1, isDarkMode ? 'rgba(16, 18, 26, 0)' : 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    data.forEach((d, i) => {
      const x = xScale(i);
      const y = yScale(d.close);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + plotW, padding.top + plotH);
    ctx.lineTo(padding.left, padding.top + plotH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line Path
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    data.forEach((d, i) => {
      const x = xScale(i);
      const y = yScale(d.close);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Pulse dot at the end
    const lastX = xScale(data.length - 1);
    const lastY = yScale(data[data.length - 1].close);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();

  }, [data, dimensions]);

  const handleMouseMove = (e) => {
    if (!canvasRef.current || !data.length) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const padding = { left: 12, right: 12 };
    const plotW = dimensions.width - padding.left - padding.right;
    const idx = Math.round(((mouseX - padding.left) / plotW) * (data.length - 1));
    const clampedIdx = Math.max(0, Math.min(data.length - 1, idx));
    setTooltip({ x: mouseX, y: e.clientY - rect.top, point: data[clampedIdx] });
  };

  const firstClose = data.length ? data[0].close : (price || 1);
  const lastClose = data.length ? data[data.length - 1].close : (price || 1);
  const periodChange = lastClose - firstClose;
  const periodChangePct = firstClose ? (periodChange / firstClose) * 100 : 0;

  const displayChange = period === '1d' ? (change ?? 0) : periodChange;
  const displayChangePct = period === '1d' ? (changePct ?? 0) : periodChangePct;
  const isBullish = displayChangePct >= 0;

  const allHighs = data.map(d => d.high || d.close);
  const allLows = data.map(d => d.low || d.close);
  const periodHigh = allHighs.length ? Math.max(...allHighs) : (price * 1.01);
  const periodLow = allLows.length ? Math.min(...allLows) : (price * 0.99);

  return (
    <div
      className="card"
      style={{
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        borderRadius: 24,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{name}</span>
            <span className={`badge ${exchange === 'NSE' ? 'badge-cyan' : 'badge-purple'}`} style={{ fontSize: 10 }}>
              {exchange}
            </span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', marginTop: 4, color: 'var(--text-primary)' }}>
            ₹{price?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) ?? '—'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div className={`price-change ${isBullish ? 'positive' : 'negative'}`} style={{ fontSize: 12 }}>
            {isBullish ? '+' : ''}{displayChange.toFixed(2)} ({isBullish ? '+' : ''}{displayChangePct.toFixed(2)}%)
          </div>

          {/* Timeframe pill selector */}
          <div className="period-selector" style={{ padding: 2, background: 'var(--bg-muted)' }}>
            {['1d', '1mo', '1y'].map(p => (
              <button
                key={p}
                className={`period-btn ${period === p ? 'active' : ''}`}
                style={{ padding: '2px 8px', fontSize: 10 }}
                onClick={() => setPeriod(p)}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: 130, marginTop: 4 }}>
        {loading && !data.length ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setTooltip(null)}
              style={{ display: 'block', cursor: 'crosshair' }}
            />
            {tooltip && tooltip.point && (
              <div style={{
                position: 'absolute',
                left: Math.min(tooltip.x + 8, dimensions.width - 130),
                top: Math.max(tooltip.y - 45, 0),
                background: 'var(--bg-dark)',
                color: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 10,
              }}>
                <div style={{ fontSize: 9, opacity: 0.7, color: '#cbd5e1' }}>{tooltip.point.date}</div>
                <div style={{ fontWeight: 700 }}>₹{tooltip.point.close?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTop: '1px solid var(--border-subtle)',
        fontSize: 11,
        color: 'var(--text-secondary)',
      }}>
        <span>High ({period.toUpperCase()}): <strong style={{ color: 'var(--text-primary)' }}>₹{periodHigh.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</strong></span>
        <span>Low ({period.toUpperCase()}): <strong style={{ color: 'var(--text-primary)' }}>₹{periodLow.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</strong></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: marketStatus.badgeType === 'open' ? 'var(--green)' : marketStatus.badgeType === 'pre-open' ? 'var(--amber)' : 'var(--text-muted)',
              boxShadow: marketStatus.badgeType === 'open' ? '0 0 6px rgba(16, 185, 129, 0.6)' : 'none',
              display: 'inline-block',
            }}
          />
          <span style={{
            fontWeight: 700,
            color: marketStatus.badgeType === 'open' ? 'var(--green-text)' : marketStatus.badgeType === 'pre-open' ? 'var(--amber-text)' : 'var(--text-secondary)'
          }}>
            {marketStatus.status}
          </span>
        </div>
      </div>
    </div>
  );
}
