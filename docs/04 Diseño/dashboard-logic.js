// Reviewed static logic for the exported dashboard. No source-string evaluation.
Object.defineProperty(window, "__dcCreateLogic", {
  value: function (DCLogic, React) {
const DIST = [
  { id: '', nombre: 'Todos los distritos' },
  { id: '150103', nombre: 'Ate' },
  { id: '150122', nombre: 'Miraflores' },
  { id: '150131', nombre: 'San Isidro' },
  { id: '150140', nombre: 'Santiago de Surco' },
];
const mk = (e, c, p, x, ev, d, pct, km, kg) => ({ hayRutas: true, pedidos: { entregados: e, enCamino: c, pendientes: p, cancelados: x, total: e + c + p + x }, ventanas: { evaluadas: ev, dentroDeVentana: d, porcentaje: pct, meta: 90 }, km, kg });
const DATA = {
  '': mk(812, 96, 312, 28, 813, 751, 92.4, 3482.6, 912.4),
  '150103': mk(214, 31, 88, 7, 220, 197, 89.5, 921.3, 241.0),
  '150122': mk(156, 18, 42, 4, 160, 151, 94.4, 512.8, 134.4),
  '150131': mk(131, 12, 37, 3, 134, 126, 94.0, 438.2, 114.8),
  '150140': { hayRutas: false, pedidos: { entregados: 0, enCamino: 0, pendientes: 0, cancelados: 0, total: 0 }, ventanas: { evaluadas: 0, dentroDeVentana: 0, porcentaje: null }, km: 0, kg: 0 },
};
const EMPTY = DATA['150140'];
const fInt = n => new Intl.NumberFormat('en-US').format(n);
const f1 = n => n === 0 ? '0' : new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
const ESTADOS = [['datos', 'Con datos'], ['cargando', 'Cargando'], ['vacio', 'Vacío'], ['error', 'Error'], ['desactualizado', 'Desactualizado']];

class Component extends DCLogic {
  state = { estado: this.props.estado ?? 'datos', distrito: '', liveMsg: '' };
  selRef = React.createRef();
  syncSel() { const s = this.selRef.current; if (s && s.value !== this.state.distrito) s.value = this.state.distrito; }
  componentDidMount() { this.syncSel(); setTimeout(() => this.syncSel(), 0); }
  componentDidUpdate(prev) {
    this.syncSel();
    if (prev.estado !== this.props.estado && this.props.estado) this.setState({ estado: this.props.estado });
  }
  componentWillUnmount() { clearTimeout(this.t); }
  load(next) {
    clearTimeout(this.t);
    this.setState({ estado: 'cargando', ...next });
    this.t = setTimeout(() => {
      const nombre = DIST.find(d => d.id === this.state.distrito).nombre;
      this.setState({ estado: 'datos', liveMsg: next ? `Indicadores actualizados para ${nombre}.` : '' });
    }, 700);
  }
  sk(h, w) {
    return React.createElement('div', { 'data-sk': '', 'aria-hidden': true, style: { height: h, width: w || '100%', background: 'var(--skeleton)', borderRadius: 4, animation: 'ap-pulse 1.4s ease-in-out infinite' } });
  }
  skGroup(items) {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } }, ...items.map(([h, w], i) => React.cloneElement(this.sk(h, w), { key: i })));
  }
  renderVals() {
    const { estado, distrito, liveMsg } = this.state;
    const showGoalProp = this.props.mostrarMeta ?? true;
    let d = estado === 'vacio' ? EMPTY : DATA[distrito];
    const isLoading = estado === 'cargando', isError = estado === 'error';
    const isEmpty = !isLoading && !isError && !d.hayRutas;
    const isStale = estado === 'desactualizado' && d.hayRutas;
    const p = d.pedidos, v = d.ventanas, t = p.total;
    const pct = n => t ? f1(n / t * 100) + ' %' : '0 %';
    const vp = v.porcentaje ?? 0;
    const showGoal = showGoalProp && v.meta != null;
    return {
      theme: this.props.tema ?? 'light',
      estados: ESTADOS.map(([k, label]) => {
        const a = k === estado;
        return { label, active: a, bg: a ? 'var(--ink)' : 'var(--surface)', color: a ? 'var(--surface)' : 'var(--ink)', border: a ? 'var(--ink)' : 'var(--border-control)', onClick: () => { clearTimeout(this.t); this.setState({ estado: k, distrito: k === 'vacio' ? '150140' : (this.state.distrito === '150140' ? '' : this.state.distrito) }); } };
      }),
      isLoading, notLoading: !isLoading, isError, isEmpty, isStale, hasData: !isLoading && !isError,
      updated: isError ? '—' : '14:32',
      distritos: DIST, distrito, selRef: this.selRef,
      distritoNombre: DIST.find(x => x.id === distrito).nombre,
      liveMsg,
      noSubmit: e => e.preventDefault(),
      onDistrito: e => this.load({ distrito: e.target.value }),
      retry: () => this.load(),
      ped: { entregados: fInt(p.entregados), total: fInt(t), aria: `Pedidos: ${p.entregados} entregados, ${p.enCamino} en camino, ${p.pendientes} pendientes, ${p.cancelados} cancelados, de ${t}` },
      segs: t ? [
        { flex: p.entregados, bg: 'var(--status-delivered)' },
        { flex: p.enCamino, bg: 'var(--status-transit)' },
        { flex: p.pendientes, bg: 'repeating-linear-gradient(135deg, var(--status-pending) 0 5px, var(--surface) 5px 7px)' },
        { flex: p.cancelados, bg: 'radial-gradient(circle, var(--surface) 1.2px, var(--status-cancelled) 1.5px) 0 0 / 6px 6px' },
      ] : [],
      legend: [
        { label: 'Entregados', n: fInt(p.entregados), p: pct(p.entregados), sw: 'var(--status-delivered)', color: 'var(--status-delivered)', icon: 'M3 8.5l3 3 7-7' },
        { label: 'En camino', n: fInt(p.enCamino), p: pct(p.enCamino), sw: 'var(--status-transit)', color: 'var(--status-transit)', icon: 'M2.5 8h10M9 4.5L12.5 8 9 11.5' },
        { label: 'Pendientes', n: fInt(p.pendientes), p: pct(p.pendientes), sw: 'repeating-linear-gradient(135deg, var(--status-pending) 0 3px, var(--surface) 3px 4px)', color: 'var(--status-pending)', icon: 'M14 8a6 6 0 1 1-12 0a6 6 0 1 1 12 0M8 4.8V8l2.2 1.6' },
        { label: 'Cancelados', n: fInt(p.cancelados), p: pct(p.cancelados), sw: 'var(--status-cancelled)', color: 'var(--status-cancelled)', icon: 'M4 4l8 8M12 4l-8 8' },
      ],
      ven: {
        pct: vp.toFixed(1), width: vp + '%', showGoal, meta: v.meta, goalLeft: `calc(${v.meta}% - 1px)`,
        dentro: fInt(v.dentroDeVentana), evaluadas: fInt(v.evaluadas),
        aria: `${vp.toFixed(1)} % dentro de ventana` + (showGoal ? `, meta ${v.meta} %` : ''),
      },
      km: isError ? '—' : f1(d.km), kg: isError ? '—' : f1(d.kg),
      srKm: isError ? 'sin dato' : `${f1(d.km)} kilómetros`, srKg: isError ? 'sin dato' : `${f1(d.kg)} kilogramos`,
      skPedidos: this.skGroup([[44, '60%'], [16], [18, '85%'], [18, '70%']]),
      skVentanas: this.skGroup([[44, '55%'], [12], [16, '70%']]),
      skCifraA: this.skGroup([[44, '80%'], [16, '50%']]),
      skCifraB: this.skGroup([[44, '80%'], [16, '50%']]),
    };
  }
}
return Component;
  },
  writable: false, configurable: false
});
