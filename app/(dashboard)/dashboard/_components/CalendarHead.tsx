import { Target } from "lucide-react";
import CalendarHeatMap from "react-calendar-heatmap";

const generateHeatmapData = () => {
  const data = [];
  const now = new Date();
  for (let i = 0; i < 90; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    data.push({
      date: date.toISOString().slice(0, 10),
      count: Math.floor(Math.random() * 3),
    });
  }
  return data;
};

const heatmapValues = generateHeatmapData();
export default function CalendarHead() {
  return (
    <div className="">
      <article className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Matriz de <span className="text-emerald-600">Consistencia</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Últimos 3 Meses
          </span>
        </div>

        {/* Contenedor con padding a la izquierda para que los labels de los días no se corten */}
        <div className="text-slate-400 text-[9px] heatmap-white font-medium pl-4">
          <CalendarHeatMap
            startDate={new Date(new Date().setDate(new Date().getDate() - 365))}
            endDate={new Date()}
            values={heatmapValues}
            showWeekdayLabels={true}
            showMonthLabels={true}
            gutterSize={2} // <--- ESTO hace los cuadros más pequeños al aumentar el espacio entre ellos
            weekdayLabels={["D", "L", "M", "M", "J", "V", "S"]}
            classForValue={(value) => {
              if (!value || value.count === 0) return "fill-slate-100";
              if (value.count === 1) return "fill-emerald-200";
              return "fill-emerald-500";
            }}
            tooltipDataAttrs={(value: any) => {
              return {
                "data-tip": `${value.date}: ${value.count} hábitos`,
              };
            }}
          />
        </div>
        <div className="text-slate-400 text-[9px] heatmap-white font-medium pl-4">
          <CalendarHeatMap
            startDate={new Date(new Date().setDate(new Date().getDate() - 365))}
            endDate={new Date()}
            values={heatmapValues}
            showWeekdayLabels={true}
            showMonthLabels={true}
            gutterSize={2} // <--- ESTO hace los cuadros más pequeños al aumentar el espacio entre ellos
            weekdayLabels={["D", "L", "M", "M", "J", "V", "S"]}
            classForValue={(value) => {
              if (!value || value.count === 0) return "fill-slate-100";
              if (value.count === 1) return "fill-emerald-200";
              return "fill-emerald-500";
            }}
            tooltipDataAttrs={(value: any) => {
              return {
                "data-tip": `${value.date}: ${value.count} hábitos`,
              };
            }}
          />
        </div>
        <div className="text-slate-400 text-[9px] heatmap-white font-medium pl-4">
          <CalendarHeatMap
            startDate={new Date(new Date().setDate(new Date().getDate() - 365))}
            endDate={new Date()}
            values={heatmapValues}
            showWeekdayLabels={true}
            showMonthLabels={true}
            gutterSize={2} // <--- ESTO hace los cuadros más pequeños al aumentar el espacio entre ellos
            weekdayLabels={["D", "L", "M", "M", "J", "V", "S"]}
            classForValue={(value) => {
              if (!value || value.count === 0) return "fill-slate-100";
              if (value.count === 1) return "fill-emerald-200";
              return "fill-emerald-500";
            }}
            tooltipDataAttrs={(value: any) => {
              return {
                "data-tip": `${value.date}: ${value.count} hábitos`,
              };
            }}
          />
        </div>

        {/* Leyenda opcional para que se vea más pro */}
        <div className="mt-4 flex justify-end items-center gap-2 text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
          <span>Menos</span>
          <div className="w-2 h-2 bg-slate-100 rounded-[1px]"></div>
          <div className="w-2 h-2 bg-emerald-200 rounded-[1px]"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-[1px]"></div>
          <span>Más</span>
        </div>
      </article>
    </div>
  );
}
