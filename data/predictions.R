housing units
med. house value
avg transit time
family satisfaction upper



prediction.creator <- function(data, change, var, model){
  col = which(colnames(data)==var) #column to change
  predictions = data.frame(matrix(nrow = 482, ncol = 8))
  names(predictions) <- c("socio_status", "fam_friendlnss", "infrastructure", "conn", "elem","upper", "health", "dev")
  
  for(i in 1:482){
    new.data <- data
    new.vals <- change #change values
    new.data[i,col] <- new.vals #reinsert values
    predictions[i,] <- lavPredict(model, type = "lv", newdata = new.data[i,]) #predict
  }
  return(predictions)
}




set = median(total$median_house_value)
set.max = max(total$median_house_value)
set.min = min(total$median_house_value)

new.set <- c(set.min, set*.5, set, set*2, set.max)

preds.min <- data.frame(1:300, 1:300, 1:300)
preds.low <- data.frame(1:300, 1:300, 1:300)
preds.med <- data.frame(1:300, 1:300, 1:300)
preds.high <- data.frame(1:300, 1:300, 1:300)
preds.max <- data.frame(1:300, 1:300, 1:300)


for(i in new.set){
    preds <- prediction.creator(data = total, change = i, var = "median_house_value", model = fit)
    
    if(i == new.set[1]){
      preds.min = preds
    } else if(i == new.set[2]){
      preds.low = preds
    } else if(i == new.set[3]){
      preds.med = preds
    } else if(i == new.set[4]){
      preds.high = preds
    } else {
      preds.max = preds
    } 
}



















