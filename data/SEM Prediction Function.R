library(lavaan)
predict_fun <- function(row, indicator, new_data, latent, model, data){
  temp <- data[row,]
  n <- temp[,which(colnames(temp)==indicator)]
  temp[1,n] <- new_data
  
  predictions <- lavPredict(model, type = "lv", newdata = temp)
  result <- predictions[which(colnames(predictions)==latent)]
  return(result)
}


