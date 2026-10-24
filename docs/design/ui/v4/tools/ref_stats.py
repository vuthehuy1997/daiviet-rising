# Thống kê giá trị sáng/tối/bão hòa của ảnh tham chiếu (chỉ phân tích, không lưu ảnh vào repo)
import sys, numpy as np, cv2
def stats(p):
    im=cv2.imread(p); im=cv2.resize(im,(960,540),interpolation=cv2.INTER_AREA)
    hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV).astype(float); g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY).astype(float)/255
    lap=cv2.Laplacian((g*255).astype(np.uint8),cv2.CV_64F).var()
    # cạnh mạnh (tỉ lệ pixel có gradient > 0.12) ~ độ "nét mực"
    gx=cv2.Sobel(g,cv2.CV_64F,1,0);gy=cv2.Sobel(g,cv2.CV_64F,0,1);edge=(np.hypot(gx,gy)>0.5).mean()
    z=im.reshape(-1,3).astype(np.float32); _,_,c=cv2.kmeans(z,6,None,(cv2.TERM_CRITERIA_EPS+cv2.TERM_CRITERIA_MAX_ITER,20,1),2,cv2.KMEANS_PP_CENTERS)
    pal=' '.join('#%02x%02x%02x'%(int(x[2]),int(x[1]),int(x[0])) for x in c)
    return dict(meanL=g.mean(),p5=np.percentile(g,5),p95=np.percentile(g,95),sat=hsv[...,1].mean()/255,edge=edge,lapvar=lap,pal=pal)
for p in sys.argv[1:]:
    s=stats(p); print(f"{p.split('/')[-1]:22s} L={s['meanL']:.2f} p5={s['p5']:.2f} p95={s['p95']:.2f} span={s['p95']-s['p5']:.2f} sat={s['sat']:.2f} edge={s['edge']:.3f} lap={s['lapvar']:.0f}\n    {s['pal']}")
