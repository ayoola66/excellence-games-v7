export default {
  attributes: {
    gameStat: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::game-stat.game-stat',
      mappedBy: 'user'
    }
  }
};
