import mongoose from 'mongoose';

const connectionStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const atlasTestSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'atlas_connection_test',
});

const AtlasTest = mongoose.models.AtlasConnectionTest || mongoose.model('AtlasConnectionTest', atlasTestSchema);

export const testAtlasConnection = async (req, res) => {
  const connectionState = connectionStates[mongoose.connection.readyState] || 'unknown';
  console.info('Atlas connection state:', connectionState);

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      ok: false,
      error: 'MongoDB Atlas is not connected',
      connection: connectionState,
    });
  }

  try {
    const tempDoc = await AtlasTest.create({});
    const foundDoc = await AtlasTest.findById(tempDoc._id).lean();
    await AtlasTest.deleteOne({ _id: tempDoc._id });

    return res.json({
      ok: true,
      message: 'MongoDB Atlas test passed',
      connection: connectionState,
      testDocument: {
        id: tempDoc._id.toString(),
        found: Boolean(foundDoc),
      }
    });
  } catch (error) {
    console.error('Atlas test endpoint error:', error);
    return res.status(500).json({
      ok: false,
      error: 'MongoDB Atlas test failed',
      connection: connectionState,
    });
  }
};