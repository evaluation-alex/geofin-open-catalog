module.exports = function(app, mbtilesLocation, port) {
  var MBTiles         = require('mbtiles');
  var mbtilesLocation = mbtilesLocation.replace(/\.mbtiles/,'') + '.mbtiles';
  new MBTiles(mbtilesLocation, function(err, mbtiles) {
    if (err) throw err;
    app.get('/-tiles/:z/:x/:y.*', function(req, res) {
      var extension = req.params['0'];
      switch (extension) {
        
        case "png": {
          mbtiles.getTile(req.params['z'], req.params['x'], req.params['y'], function(err, tile, headers) {
            if (err) {
              res.status(404).send('Tile rendering error: ' + err + '\n');
            } else {
              res.header("Content-Type", "image/png")
              res.send(tile);
            }
          });
          break;
        }
        
        case "grid.json": {
          mbtiles.getGrid(req.params['z'], req.params['x'], req.params['y'], function(err, grid, headers) {
            if (err) {
              res.status(404).send('Grid rendering error: ' + err + '\n');
            } else {
              res.header("Content-Type", "text/json")
              res.send(grid);
            }
          });
          break;
        }
      }
    });
  });
}