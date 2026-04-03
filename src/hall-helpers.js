import RectTableHelper, {
    helperMeta as rectTableMeta,
  } from './helpers/rect-table.jsx';
  
  /*
    Как добавлять новые инструменты:
  
    1. Импортируешь компонент:
       import ArcHelper from './helpers/arc-helper.jsx';
  
    2. Добавляешь его в нужную группу:
       {
         id: 'arcs',
         title: 'Дуги',
         items: [
           {
             id: 'arc-helper',
             title: 'Генератор дуги',
             description: 'Построение дуги и координат',
             Component: ArcHelper,
           },
         ],
       }
  
    Если группы нет — создаёшь новую.
  */
  
  export const hallHelperGroups = [
    {
      id: 'tables',
      title: 'Столы',
      items: [
        {
          id: rectTableMeta?.id || 'rect-table',
          title: rectTableMeta?.title || 'Прямоугольные столы',
          description:
            rectTableMeta?.description || 'DXDY, карта, поворот, экспорт шаблона',
          Component: RectTableHelper,
        },
      ],
    },
  ];
  
  export const hallHelpers = hallHelperGroups.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      groupId: group.id,
      groupTitle: group.title,
    }))
  );
  
  export function getHallHelperById(id) {
    return hallHelpers.find((item) => item.id === id) || null;
  }