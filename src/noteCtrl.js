"use strict";

const response = require("./response");
const DynamoDb = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDb.DocumentClient({ region: "us-east-1" });
// const documentClient = new DynamoDb.DocumentClient({
//   region: "us-east-1",
//   maxRetries: 3,
//   httpOptions: {
//     timeout: 5000,
//   },
// });
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

async function create(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;
  const data = JSON.parse(event.body);
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        noteId: data.id,
        title: data.title,
        body: data.body,
      },
      ConditionExpression: "attribute_not_exists(noteId)",
    };
    await documentClient.put(params).promise();
    callback(null, response.send(201, data));
  } catch (error) {
    callback(null, response.error(error));
  }
}

async function update(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;
  const noteId = event.pathParameters.id;
  const data = JSON.parse(event.body);
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { noteId },
      UpdateExpression: "set #title = :title, #body = :body",
      ExpressionAttributeNames: {
        "#title": "title",
        "#body": "body",
      },
      ExpressionAttributeValues: {
        ":title": data.title,
        ":body": data.body,
      },
      ConditionExpression: "attribute_exists(noteId)",
    };
    await documentClient.update(params).promise();
    callback(null, response.send(200, { id: noteId, ...data }));
  } catch (error) {
    callback(null, response.error(error));
  }
}

async function remove(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;
  const noteId = event.pathParameters.id;
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { noteId },
      ConditionExpression: "attribute_exists(noteId)",
    };

    await documentClient.delete(params).promise();
    callback(null, response.send(200, noteId));
  } catch (error) {
    callback(null, response.error(error));
  }
}
async function getOne(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;
  const noteId = event.pathParameters.id;
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { noteId },
    };
    const data = await documentClient.get(params).promise();
    if (data.Item) {
      callback(null, response.send(200, data.Item));
    } else {
      callback(
        null,
        response.send(404, {
          code: "02",
          message: "No Note found with this Id",
        })
      );
    }
  } catch (error) {
    callback(null, response.error(error));
  }
}
async function getAll(event, context, callback) {
  console.log(event);
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
    };

    const data = await documentClient.scan(params).promise();
    callback(null, response.send(200, data));
  } catch (error) {
    callback(null, response.error(error));
  }
}

module.exports = { create, update, getOne, getAll, remove };
