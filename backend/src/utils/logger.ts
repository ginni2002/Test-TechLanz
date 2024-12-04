import winston from "winston";
import path from "path";

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${message}${stack ? "\n" + stack : ""}`;
  })
);

export const logger = winston.createLogger({
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),

    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),

    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
    }),
  ],
});
